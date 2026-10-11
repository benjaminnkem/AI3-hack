/* Mesh incubation deck build. Run from repo root: node docs/pitch/build-deck.cjs
 * deck/index.html (source of truth) -> previews/slide-NN.png, mesh-incubation-deck.pdf,
 * mesh-incubation-deck.pptx (full-bleed slide images + speaker notes), speaker-notes.md */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const pptxgen = require('pptxgenjs');

const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dir = __dirname;
const html = fs.readFileSync(path.join(dir, 'deck/index.html'), 'utf8');
const url = 'file://' + path.join(dir, 'deck/index.html');
const notes = [...html.matchAll(/<section class="slide[^"]*" data-notes="([^"]*)"/g)].map((m) =>
  m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
);
const N = notes.length;
const prev = path.join(dir, 'previews');
fs.rmSync(prev, { recursive: true, force: true });
fs.mkdirSync(prev);

const profile = fs.mkdtempSync(path.join(require('os').tmpdir(), 'mesh-deck-'));
const chrome = (args) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return execFileSync(
        CHROME,
        ['--headless=new', '--hide-scrollbars', `--user-data-dir=${profile}`, ...args],
        { stdio: 'ignore', timeout: 90000 },
      );
    } catch (e) {
      if (attempt >= 3) throw e;
    }
  }
};

for (let n = 1; n <= N; n++) {
  const f = path.join(prev, `slide-${String(n).padStart(2, '0')}.png`);
  chrome([
    '--window-size=1920,1080',
    '--virtual-time-budget=4000',
    `--screenshot=${f}`,
    `${url}#${n}`,
  ]);
}
chrome([
  '--no-pdf-header-footer',
  '--virtual-time-budget=6000',
  `--print-to-pdf=${path.join(dir, 'mesh-incubation-deck.pdf')}`,
  url,
]);

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.title = 'Mesh Incubation deck';
pptx.author = 'Mesh';
for (let n = 1; n <= N; n++) {
  const s = pptx.addSlide();
  s.addImage({
    path: path.join(prev, `slide-${String(n).padStart(2, '0')}.png`),
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
  });
  s.addNotes(notes[n - 1]);
}
pptx.writeFile({ fileName: path.join(dir, 'mesh-incubation-deck.pptx') }).then(() => {
  fs.writeFileSync(
    path.join(dir, 'speaker-notes.md'),
    '# Mesh incubation deck - speaker notes\n\n' +
      notes.map((t, i) => `## Slide ${i + 1}\n\n${t}\n`).join('\n'),
  );
  console.log(`built ${N} slides`);
});
