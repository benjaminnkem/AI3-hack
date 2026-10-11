/* Mesh incubation pitch deck. Run: node docs/pitch/build-deck.cjs */
const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Mesh';
pptx.subject = 'Incubation capabilities for SIMAN LABS';
pptx.title = 'Mesh — The living evidence network';
pptx.company = 'Mesh';
pptx.lang = 'en-NG';
pptx.theme = {
  headFontFace: 'Space Grotesk',
  bodyFontFace: 'Avenir Next',
  lang: 'en-US',
};

const W = 13.333,
  H = 7.5;
const C = {
  dark: '07110F',
  black: '030908',
  forest: '10231D',
  panel: '132A22',
  line: '28473A',
  green: '35E3A0',
  lime: 'B8F8D9',
  cream: 'F2F4EE',
  white: 'FFFFFF',
  muted: '9BB4A9',
  ink: '10231E',
  gray: '596B62',
  soft: 'DCE9E1',
  yellow: 'F2C66A',
  blue: 'A3C8FF',
  red: 'F49C8A',
};
const A = (name) => path.join(__dirname, 'assets', name);
const ST = pptx.ShapeType;
const bg = (s, color) => (s.background = { color });
const shape = (s, type, x, y, w, h, fill, line = 'none', radius = 0.12, extra = {}) =>
  s.addShape(type, {
    x,
    y,
    w,
    h,
    rectRadius: radius,
    fill: { color: fill },
    line: line === 'none' ? { color: fill, transparency: 100 } : { color: line, width: 1 },
    ...extra,
  });
const rect = (s, x, y, w, h, fill, line = 'none', r = 0) =>
  shape(s, r ? ST.roundRect : ST.rect, x, y, w, h, fill, line, r);
const circle = (s, x, y, d, fill, line = 'none') => shape(s, ST.ellipse, x, y, d, d, fill, line);
const ln = (s, x1, y1, x2, y2, color = C.line, width = 1, dash = 'solid') =>
  s.addShape(ST.line, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: { color, width, dashType: dash, beginArrowType: 'none', endArrowType: 'none' },
  });
const tx = (s, text, x, y, w, h, size = 18, color = C.white, opts = {}) =>
  s.addText(text, {
    x,
    y,
    w,
    h,
    fontFace: opts.fontFace || 'Avenir Next',
    fontSize: size,
    color,
    bold: !!opts.bold,
    breakLine: false,
    margin: 0,
    fit: 'shrink',
    valign: opts.valign || 'mid',
    align: opts.align || 'left',
    transparency: opts.transparency || 0,
    charSpacing: opts.charSpacing || 0,
    italic: !!opts.italic,
    ...opts,
  });
const mono = (s, text, x, y, w, h, size = 11, color = C.muted, opts = {}) =>
  tx(s, text, x, y, w, h, size, color, {
    fontFace: 'Avenir Next',
    charSpacing: 1.6,
    bold: true,
    ...opts,
  });
const pill = (s, text, x, y, w, fill = C.panel, color = C.lime, stroke = null) => {
  rect(s, x, y, w, 0.37, fill, stroke || fill, 0.18);
  tx(s, text, x + 0.13, y + 0.05, w - 0.26, 0.26, 10, color, { bold: true, charSpacing: 0.6 });
};
const photo = (s, p, x, y, w, h) => s.addImage({ path: p, x, y, w, h, sizingCrop: true });
const corner = (s, n, dark = true) => {
  const fg = dark ? C.muted : C.gray;
  mono(s, 'MESH  /  INCUBATION', 0.65, 7.1, 3.0, 0.19, 8.5, fg);
  mono(s, String(n).padStart(2, '0') + '  /  24', 11.9, 7.1, 0.78, 0.19, 8.5, fg, {
    align: 'right',
  });
};
const newSlide = (n, dark = true) => {
  const s = pptx.addSlide();
  bg(s, dark ? C.dark : C.cream);
  corner(s, n, dark);
  return s;
};
const chip = (s, text, x, y, w, dark = true) => {
  rect(s, x, y, w, 0.47, dark ? C.forest : C.white, dark ? C.line : C.soft, 0.16);
  tx(s, text, x + 0.13, y + 0.06, w - 0.25, 0.31, 12, dark ? C.lime : C.ink, { bold: true });
};
const dot = (s, x, y, color = C.green, d = 0.11) => circle(s, x, y, d, color);

// Feature frame intentionally leaves the right half open for a bespoke product scene.
function feature(
  n,
  id,
  eyebrow,
  title,
  sub,
  draw,
  { light = false, accent = C.green, bodyW = 5.35 } = {},
) {
  const s = newSlide(n, !light),
    fg = light ? C.ink : C.white,
    muted = light ? C.gray : C.muted;
  mono(s, `${id}  /  ${eyebrow.toUpperCase()}`, 0.65, 0.58, 6.0, 0.26, 10.5, accent);
  const gated = Number(id.slice(1)) >= 13;
  pill(
    s,
    gated ? 'GATED PILOT' : 'PROPOSED',
    gated ? 11.11 : 11.54,
    0.54,
    gated ? 1.54 : 1.11,
    light ? C.soft : C.forest,
    light ? C.ink : C.lime,
  );
  tx(s, title, 0.65, 1.05, 6.15, 1.52, 37, fg, {
    fontFace: 'Space Grotesk',
    bold: true,
    breakLine: false,
  });
  tx(s, sub, 0.68, 2.81, bodyW, 1.15, 18, muted, { valign: 'top', breakLine: false });
  ln(s, 0.68, 4.34, 5.82, 4.34, light ? C.soft : C.line, 1);
  draw(s, light);
  return s;
}
function miniCard(
  s,
  x,
  y,
  w,
  h,
  title,
  body,
  { fill = C.panel, stroke = C.line, bright = false } = {},
) {
  rect(s, x, y, w, h, fill, stroke, 0.17);
  tx(s, title, x + 0.22, y + 0.22, w - 0.44, 0.36, 15, bright ? C.green : C.white, { bold: true });
  tx(s, body, x + 0.22, y + 0.73, w - 0.44, h - 0.86, 12, C.muted, { valign: 'top' });
}

// 01 — cover
{
  const s = pptx.addSlide();
  bg(s, C.black);
  photo(s, A('research-editorial.png'), 0, 0, W, H);
  rect(s, 0, 0, 6.25, H, C.black, 'none');
  rect(s, 5.75, 0, 1.3, H, C.black, 'none');
  mono(s, 'MESH  ×  SIMAN LABS', 0.68, 0.55, 5.1, 0.25, 11, C.green);
  tx(s, 'Check before\nyou trust.', 0.68, 1.43, 8.15, 2.4, 60, C.white, {
    fontFace: 'Space Grotesk',
    bold: true,
    breakLine: false,
  });
  tx(
    s,
    'A living evidence network for people, institutions, developers and AI agents.',
    0.73,
    4.38,
    5.45,
    1.0,
    20,
    C.soft,
    { valign: 'top' },
  );
  pill(s, 'INCUBATION PRODUCT VISION', 0.72, 6.25, 2.75, C.forest, C.lime);
  mono(s, 'MESH  /  2026', 11.55, 7.08, 1.15, 0.2, 9, C.muted, { align: 'right' });
}

// 02 — problem, expressive editorial layout
{
  const s = newSlide(2, false);
  mono(s, '01 / THE INTERNET HAS A CONTEXT PROBLEM', 0.66, 0.55, 8.6, 0.27, 11, C.gray);
  tx(s, 'Claims travel\nfaster than evidence.', 0.66, 1.05, 5.63, 1.75, 47, C.ink, {
    fontFace: 'Space Grotesk',
    bold: true,
  });
  tx(
    s,
    'A claim is copied, cropped, translated and repeated. Its source, date and uncertainty fall away.',
    0.68,
    3.2,
    5.1,
    1.1,
    19,
    C.gray,
    { valign: 'top' },
  );
  const cards = [
    ['A post', '“This happened today.”'],
    ['A screenshot', 'The original source disappears.'],
    ['A decision', 'Someone acts on the claim.'],
  ];
  cards.forEach((c, i) => {
    const x = 6.55 + i * 2.08,
      y = 1.63 + i * 0.65;
    rect(s, x, y, 1.92, 2.1, i === 2 ? C.forest : C.white, i === 2 ? C.forest : C.soft, 0.15);
    mono(s, `0${i + 1}`, x + 0.18, y + 0.18, 0.4, 0.2, 10, i === 2 ? C.green : C.gray);
    tx(s, c[0], x + 0.18, y + 0.66, 1.5, 0.43, 17, i === 2 ? C.white : C.ink, { bold: true });
    tx(s, c[1], x + 0.18, y + 1.18, 1.5, 0.56, 11.5, i === 2 ? C.muted : C.gray, { valign: 'top' });
    if (i < 2) ln(s, x + 1.94, y + 1.07, x + 2.08, y + 1.07, C.green, 2);
  });
  rect(s, 0.68, 5.54, 5.52, 0.86, C.ink, C.ink, 0.16);
  tx(s, 'Mesh reconnects the claim to its evidence.', 0.93, 5.72, 5.0, 0.47, 18, C.white, {
    bold: true,
  });
}

// 03 — current product, showing an actual Mesh image
{
  const s = newSlide(3, true);
  mono(s, 'MESH TODAY  /  FUNCTIONAL MVP', 0.65, 0.55, 5, 0.25, 11, C.green);
  tx(s, 'An Evidence Passport\nfor every digital claim.', 0.65, 1.04, 6.55, 1.56, 41, C.white, {
    fontFace: 'Space Grotesk',
    bold: true,
  });
  tx(
    s,
    'Submit text, a URL or an image. Mesh breaks it into claims, retrieves sources, compares independent Gonka model assessments and publishes an inspectable Passport.',
    0.68,
    2.96,
    5.65,
    1.7,
    18,
    C.muted,
    { valign: 'top' },
  );
  chip(s, 'Multi-model assessment', 0.68, 5.28, 2.55);
  chip(s, 'Public Passport', 3.35, 5.28, 2.05);
  chip(s, 'Sepolia integrity', 0.68, 5.88, 2.2);
  rect(s, 7.0, 0.72, 5.72, 5.95, C.forest, C.line, 0.2);
  photo(s, A('mesh-landing.webp'), 7.15, 0.87, 5.42, 5.65);
  mono(s, 'MESH BRAND VISUAL', 8.8, 6.78, 3.8, 0.2, 8, C.muted, { align: 'right' });
}

// 04 — position and boundaries
{
  const s = newSlide(4, false);
  mono(s, 'THE PRODUCT SHIFT', 0.65, 0.55, 5.0, 0.25, 11, C.gray);
  tx(s, 'From one-time check\nto living evidence.', 0.65, 1.03, 8.7, 1.57, 46, C.ink, {
    fontFace: 'Space Grotesk',
    bold: true,
  });
  tx(
    s,
    'The next capabilities form one connected system. Each new surface reads the same claim, evidence, method and Passport history.',
    0.68,
    2.91,
    6.25,
    1.13,
    19,
    C.gray,
    { valign: 'top' },
  );
  const rows = [
    ['INVESTIGATE', 'Claims + adaptive research'],
    ['REMEMBER', 'Graph + source lineage'],
    ['UPDATE', 'Versions + watches'],
    ['ACT', 'Policies + attestations'],
  ];
  rows.forEach((r, i) => {
    const x = 0.67 + i * 3.13;
    rect(s, x, 4.69, 2.88, 1.42, i === 3 ? C.ink : C.white, i === 3 ? C.ink : C.soft, 0.18);
    mono(s, r[0], x + 0.2, 4.92, 2.45, 0.25, 10, i === 3 ? C.green : C.gray);
    tx(s, r[1], x + 0.2, 5.36, 2.48, 0.49, 16, i === 3 ? C.white : C.ink, { bold: true });
  });
  tx(
    s,
    'Evidence-based assessment   ≠   cryptographic integrity   ≠   real-world truth',
    0.69,
    6.46,
    10.8,
    0.3,
    12,
    C.gray,
    { bold: true },
  );
}

// F01
feature(
  5,
  'F01',
  'Mesh Memory + Claim Graph',
  'The internet repeats.\nMesh remembers.',
  'Equivalent claims, translations and media variants resolve to the same proposition only when their meaning, place and time truly match.',
  (s) => {
    const nodes = [
      ['EN', 'Scholarship cancelled', 9.68, 1.22],
      ['YO', 'A fagile sikolashipu', 7.35, 2.41],
      ['POST', 'Cropped screenshot', 10.4, 3.1],
      ['CLAIM', 'Canonical proposition', 8.85, 4.35],
    ];
    ln(s, 10.2, 1.86, 9.78, 4.44, C.green, 1.6);
    ln(s, 8.6, 3.06, 9.53, 4.44, C.green, 1.6);
    ln(s, 10.74, 3.78, 10.12, 4.44, C.green, 1.6);
    nodes.forEach((n, i) => {
      rect(
        s,
        n[2] - 0.55,
        n[3],
        i === 3 ? 3.15 : 2.35,
        0.78,
        i === 3 ? C.green : C.forest,
        i === 3 ? C.green : C.line,
        0.18,
      );
      mono(s, n[0], n[2] - 0.36, n[3] + 0.12, 0.56, 0.17, 8, i === 3 ? C.ink : C.green);
      tx(
        s,
        n[1],
        n[2] - 0.36,
        n[3] + 0.35,
        i === 3 ? 2.85 : 2.1,
        0.25,
        11.5,
        i === 3 ? C.ink : C.white,
        { bold: true },
      );
    });
    mono(s, 'MATCH ONLY WITH CONTEXT', 0.68, 4.68, 4.2, 0.28, 10, C.green);
    tx(
      s,
      'No automatic merge across negation or incompatible dates.',
      0.68,
      5.16,
      5.1,
      0.76,
      16,
      C.white,
      { bold: true },
    );
  },
);

// F02
feature(
  6,
  'F02',
  'Adaptive Evidence Research',
  'Research that knows\nwhat is missing.',
  'A typed plan seeks primary sources, counterevidence and coverage of every critical claim slot. Weak evidence produces an honest abstention.',
  (s) => {
    mono(s, 'A CLAIM ABOUT A POLICY', 0.68, 4.73, 4.0, 0.22, 10, C.green);
    tx(
      s,
      'Who?  What?  Where?  When?  Under which condition?',
      0.68,
      5.13,
      5.25,
      0.72,
      17,
      C.white,
      { bold: true },
    );
    rect(s, 7.05, 0.95, 5.53, 5.68, C.forest, C.line, 0.22);
    mono(s, 'EVIDENCE PLAN', 7.37, 1.26, 3.3, 0.23, 10, C.green);
    const r = [
      ['01', 'Official record', 'Found'],
      ['02', 'Effective date', 'Missing'],
      ['03', 'Counter-search', 'In progress'],
      ['04', 'Source independence', '2 families'],
    ];
    r.forEach((a, i) => {
      const y = 1.79 + i * 0.94;
      rect(s, 7.33, y, 4.95, 0.74, C.dark, C.line, 0.12);
      mono(s, a[0], 7.53, y + 0.18, 0.38, 0.2, 9, C.green);
      tx(s, a[1], 8.1, y + 0.14, 2.55, 0.27, 13, C.white, { bold: true });
      tx(s, a[2], 10.75, y + 0.17, 1.3, 0.23, 10, a[2] === 'Missing' ? C.yellow : C.muted, {
        align: 'right',
      });
    });
    pill(s, 'SEARCH MORE  /  ABSTAIN', 7.33, 5.77, 2.78, C.green, C.ink);
  },
  { light: false },
);

// F03
feature(
  7,
  'F03',
  'EvidenceProof',
  'Every citation earns\nits place.',
  'A cited sentence links to an exact source excerpt, retrieval record, preserved snapshot when permitted and the source family it came from.',
  (s) => {
    mono(s, 'FIVE URLS ARE NOT FIVE CONFIRMATIONS', 0.68, 4.75, 4.95, 0.25, 10, C.green);
    tx(
      s,
      'Source lineage reveals when reports all repeat one origin.',
      0.68,
      5.17,
      5.2,
      0.72,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 6.93, 1.04, 5.72, 5.46, C.cream, C.cream, 0.18);
    mono(s, 'EVIDENCE  #04', 7.31, 1.38, 2.4, 0.22, 10, C.gray);
    pill(s, 'VERBATIM', 10.77, 1.29, 1.32, C.soft, C.ink);
    tx(s, '“The decision takes effect on 1 March...”', 7.31, 2.05, 4.8, 1.15, 26, C.ink, {
      fontFace: 'Space Grotesk',
      bold: true,
    });
    ln(s, 7.31, 3.36, 12.18, 3.36, C.soft, 1);
    [
      ['SOURCE', 'Official notice'],
      ['CAPTURED', '12 Oct 2026'],
      ['LINEAGE', 'Original publication'],
      ['CONTENT HASH', 'sha3: 7b42…d91a'],
    ].forEach((v, i) => {
      mono(s, v[0], 7.31, 3.7 + i * 0.56, 1.33, 0.18, 8.5, C.gray);
      tx(s, v[1], 8.91, 3.67 + i * 0.56, 3.15, 0.24, 12, C.ink, { bold: true });
    });
  },
);

// F04
feature(
  8,
  'F04',
  'Living Passports',
  'A finding can change.\nThe record cannot.',
  'Each refresh creates a new immutable Passport version. Readers see what evidence moved, what stayed uncertain and which version was relied on.',
  (s) => {
    mono(s, 'THE CURRENT VIEW IS A POINTER', 0.68, 4.72, 4.8, 0.24, 10, C.green);
    tx(s, 'Prior hashes and conclusions remain verifiable.', 0.68, 5.14, 5.12, 0.62, 17, C.white, {
      bold: true,
    });
    const v = [
      ['v1', 'JUL', 'Original assessment', 7.13, 2.15],
      ['v2', 'OCT', 'New primary source', 9.15, 3.02],
      ['v3', 'NOW', 'Correction + delta', 10.92, 4.02],
    ];
    v.forEach((a, i) => {
      if (i < 2)
        ln(s, a[3] + 1.12, a[4] + 0.45, v[i + 1][3] + 0.15, v[i + 1][4] + 0.45, C.green, 2);
      rect(
        s,
        a[3],
        a[4],
        1.62,
        1.05,
        i === 2 ? C.green : C.forest,
        i === 2 ? C.green : C.line,
        0.18,
      );
      mono(s, a[0], a[3] + 0.18, a[4] + 0.15, 0.6, 0.2, 11, i === 2 ? C.ink : C.green);
      tx(s, a[1], a[3] + 0.18, a[4] + 0.45, 1.25, 0.3, 16, i === 2 ? C.ink : C.white, {
        bold: true,
      });
      tx(s, a[2], a[3], a[4] + 1.16, 1.9, 0.56, 11, C.muted, { valign: 'top' });
    });
  },
);

// F05
feature(
  9,
  'F05',
  'Passport Watch',
  'When the evidence moves,\npeople know.',
  'Follow a claim. Receive one meaningful alert when a source corrects, a dispute opens or a Passport becomes stale.',
  (s) => {
    mono(s, 'MATERIAL CHANGES ONLY', 0.68, 4.72, 4.5, 0.24, 10, C.green);
    tx(s, 'A quiet subscription until trust changes.', 0.68, 5.11, 5.15, 0.62, 17, C.white, {
      bold: true,
    });
    rect(s, 7.18, 1.08, 4.65, 5.49, C.cream, C.cream, 0.28);
    rect(s, 7.39, 1.35, 4.24, 0.67, C.soft, C.soft, 0.15);
    tx(s, 'Watching  /  Scholarship notice', 7.61, 1.51, 3.75, 0.29, 14, C.ink, { bold: true });
    rect(s, 7.39, 2.24, 4.24, 2.26, C.white, C.soft, 0.17);
    circle(s, 7.61, 2.53, 0.38, C.green);
    tx(s, 'Source correction', 8.15, 2.45, 3.15, 0.37, 18, C.ink, { bold: true });
    tx(
      s,
      'The official deadline changed. Passport v2 is ready with the evidence delta.',
      7.61,
      3.11,
      3.68,
      1.0,
      13,
      C.gray,
      { valign: 'top' },
    );
    pill(s, 'VIEW PASSPORT v2', 7.59, 4.83, 2.43, C.ink, C.white);
    mono(s, 'TELEGRAM  ·  WEB  ·  SIGNED WEBHOOK', 7.57, 5.77, 3.86, 0.45, 9, C.gray);
  },
);

// F06
feature(
  10,
  'F06',
  'Real Image Verification',
  'A real image can carry\na false story.',
  'Visual media gets separate findings for image provenance, context match, embedded text and the factual claim in its caption.',
  (s) => {
    mono(s, 'AUTHENTICITY  ≠  CONTEXT', 0.68, 4.7, 5.3, 0.27, 10, C.green);
    tx(
      s,
      '“No C2PA credential” is not evidence of a fake image.',
      0.68,
      5.12,
      5.25,
      0.84,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 6.99, 0.98, 5.73, 5.47, C.forest, C.line, 0.19);
    photo(s, A('research-editorial.png'), 7.2, 1.2, 5.3, 2.25);
    rect(s, 7.2, 3.67, 2.45, 1.23, C.dark, C.line, 0.13);
    mono(s, 'IMAGE', 7.41, 3.86, 1.3, 0.2, 9, C.green);
    tx(s, 'May be genuine', 7.41, 4.23, 2.0, 0.35, 15, C.white, { bold: true });
    rect(s, 9.81, 3.67, 2.49, 1.23, C.dark, C.line, 0.13);
    mono(s, 'CAPTION', 10.04, 3.86, 1.3, 0.2, 9, C.yellow);
    tx(s, 'Context disputed', 10.04, 4.23, 2.04, 0.35, 15, C.white, { bold: true });
    tx(s, 'Earliest known indexed use · not absolute origin', 7.3, 5.29, 4.94, 0.32, 11, C.muted);
  },
);

// F07
feature(
  11,
  'F07',
  'Mesh Lens',
  'Context where\nthe claim appears.',
  'An opt-in browser layer finds a current Passport for selected text, images or URLs. People can inspect context without leaving the page.',
  (s) => {
    mono(s, 'SELECT  →  LOOK UP  →  EXPLORE', 0.68, 4.76, 5.3, 0.25, 10, C.green);
    tx(
      s,
      'Trust Tags show freshness and limits, not a magic verdict.',
      0.68,
      5.16,
      5.25,
      0.84,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 6.94, 1.03, 5.68, 5.37, C.cream, C.cream, 0.16);
    rect(s, 6.94, 1.03, 5.68, 0.42, C.soft, C.soft, 0.16);
    circle(s, 7.15, 1.17, 0.09, C.red);
    circle(s, 7.32, 1.17, 0.09, C.yellow);
    circle(s, 7.49, 1.17, 0.09, C.green);
    tx(s, 'News article headline with a selected claim', 7.34, 1.8, 4.25, 0.94, 23, C.ink, {
      bold: true,
      fontFace: 'Space Grotesk',
    });
    rect(s, 7.36, 3.16, 4.81, 0.4, C.soft, C.soft, 0.06);
    tx(s, '“Scholarship programme has ended.”', 7.48, 3.22, 4.48, 0.27, 12, C.ink);
    rect(s, 8.59, 3.83, 3.54, 1.88, C.forest, C.forest, 0.17);
    pill(s, 'MESH CONTEXT AVAILABLE', 8.78, 4.06, 2.58, C.green, C.ink);
    tx(s, 'Current Passport · 3 source families', 8.8, 4.62, 3.0, 0.34, 12, C.white, {
      bold: true,
    });
    tx(s, 'Open evidence and limitations →', 8.8, 5.14, 3.05, 0.3, 11, C.muted);
  },
);

// F08
feature(
  12,
  'F08',
  'Share to Mesh',
  'Forward the claim.\nGet context back.',
  'Web, Telegram and an authorized WhatsApp pilot use one verification backend. Replies carry a short grounded summary and the full Passport.',
  (s) => {
    mono(s, 'ONE PIPELINE  /  EVERY ENTRY POINT', 0.68, 4.73, 5.3, 0.25, 10, C.green);
    tx(s, 'No silent reading of private chats.', 0.68, 5.13, 4.9, 0.6, 17, C.white, { bold: true });
    const xs = [7.05, 8.95, 10.85],
      labels = ['WEB', 'TELEGRAM', 'WHATSAPP'];
    xs.forEach((x, i) => {
      rect(s, x, 1.32, 1.67, 4.62, i === 1 ? C.cream : C.forest, i === 1 ? C.cream : C.line, 0.23);
      mono(s, labels[i], x + 0.18, 1.64, 1.33, 0.2, 9, i === 1 ? C.gray : C.green);
      rect(s, x + 0.16, 2.21, 1.35, 0.88, i === 1 ? C.soft : C.dark, 'none', 0.12);
      tx(s, 'Claim or image', x + 0.27, 2.38, 1.15, 0.45, 11, i === 1 ? C.ink : C.white, {
        bold: true,
      });
      rect(s, x + 0.16, 3.41, 1.35, 1.56, i === 1 ? C.white : C.dark, 'none', 0.12);
      dot(s, x + 0.3, 3.65, C.green);
      tx(s, 'Evidence card', x + 0.47, 3.58, 0.87, 0.57, 12, i === 1 ? C.ink : C.white, {
        bold: true,
      });
      tx(
        s,
        'As-of date\nSources\nPassport link',
        x + 0.28,
        4.18,
        1.0,
        0.62,
        10,
        i === 1 ? C.gray : C.muted,
        { valign: 'top' },
      );
    });
    mono(s, 'WHATSAPP REQUIRES PROVIDER APPROVAL + OPT-IN', 7.05, 6.23, 5.54, 0.24, 8.5, C.muted);
  },
);

// F09
feature(
  13,
  'F09',
  'Mesh Guard',
  'A pause before\nthe risky action.',
  'One focused wedge: proposed “Before You Share.” Mesh surfaces misleading context, missing proof and staleness when a person is about to forward content.',
  (s) => {
    mono(s, 'PRODUCT CHOICE TO CONFIRM', 0.68, 4.72, 5.1, 0.24, 10, C.yellow);
    tx(
      s,
      'The alternative wedge is Opportunity / Scam Check.',
      0.68,
      5.14,
      5.35,
      0.72,
      15,
      C.muted,
      { bold: true },
    );
    rect(s, 7.15, 1.21, 5.08, 5.0, C.forest, C.line, 0.19);
    mono(s, 'BEFORE YOU SHARE', 7.5, 1.56, 3.5, 0.24, 10, C.green);
    tx(s, 'This claim has context\nyou should see.', 7.5, 2.12, 4.2, 1.0, 27, C.white, {
      fontFace: 'Space Grotesk',
      bold: true,
    });
    [
      ['NEW EVIDENCE', 'Official notice corrected'],
      ['UNKNOWN', 'Original date unclear'],
      ['NEXT STEP', 'Share with Passport link'],
    ].forEach((a, i) => {
      const y = 3.41 + i * 0.72;
      dot(s, 7.53, y + 0.09, i === 1 ? C.yellow : C.green);
      mono(s, a[0], 7.77, y, 1.54, 0.25, 9, i === 1 ? C.yellow : C.green);
      tx(s, a[1], 9.21, y - 0.02, 2.5, 0.34, 12, C.white, { bold: true });
    });
  },
);

// F10
feature(
  14,
  'F10',
  'MCP + Trust Policy Engine',
  'Give agents evidence.\nKeep humans in control.',
  'Typed tools return exact Passport versions, evidence and policy decisions. High-risk actions fail closed or escalate when information is stale or incomplete.',
  (s) => {
    mono(s, 'A POLICY GATE IS ADVISORY', 0.68, 4.74, 4.8, 0.25, 10, C.green);
    tx(
      s,
      'A supported verdict alone never authorizes a transaction.',
      0.68,
      5.15,
      5.28,
      0.8,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 6.96, 1.03, 5.65, 5.38, C.forest, C.line, 0.17);
    mono(s, 'mesh.evaluate_policy', 7.28, 1.32, 4.45, 0.24, 11, C.green);
    const lines = [
      ['passportVersion', '"v3"'],
      ['freshness', '"current"'],
      ['sourceFamilies', '2'],
      ['requiredFamilies', '3'],
      ['decision', '"ESCALATE"'],
    ];
    lines.forEach((a, i) => {
      tx(s, a[0], 7.4, 1.93 + i * 0.68, 2.8, 0.32, 14, C.muted, { fontFace: 'Space Grotesk' });
      tx(s, a[1], 10.22, 1.93 + i * 0.68, 1.86, 0.32, 14, i === 4 ? C.yellow : C.white, {
        fontFace: 'Space Grotesk',
        bold: true,
      });
      if (i < 4) ln(s, 7.32, 2.43 + i * 0.68, 12.23, 2.43 + i * 0.68, C.line, 0.7);
    });
  },
);

// F11
feature(
  15,
  'F11',
  'MethodHash + Attestations',
  'Verify the method,\nnot just the artifact.',
  'Signed Passports bind an exact assessment and method version. Third parties can check hashes and attestations without confusing integrity with truth.',
  (s) => {
    mono(s, 'ETHEREUM SEPOLIA  /  TESTNET', 0.68, 4.72, 5.3, 0.25, 10, C.green);
    tx(
      s,
      'Chain confirmation proves publication and integrity.',
      0.68,
      5.12,
      5.23,
      0.72,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 7.17, 1.05, 4.93, 5.23, C.cream, C.cream, 0.17);
    mono(s, 'PASSPORT  /  v2', 7.49, 1.37, 3.58, 0.25, 10, C.gray);
    tx(s, 'Method manifest', 7.49, 1.99, 3.8, 0.43, 22, C.ink, {
      bold: true,
      fontFace: 'Space Grotesk',
    });
    [
      ['Schema', '2.0'],
      ['Scoring', 'manifest: 4d21…'],
      ['Evidence root', '0x1a83…'],
      ['MethodHash', '0xc423…'],
    ].forEach((a, i) => {
      mono(s, a[0].toUpperCase(), 7.49, 2.77 + i * 0.59, 1.72, 0.18, 8.5, C.gray);
      tx(s, a[1], 9.25, 2.72 + i * 0.59, 2.38, 0.29, 13, C.ink, { bold: true });
    });
    pill(s, 'SIGNATURE VALID', 7.48, 5.47, 2.08, C.green, C.ink);
  },
);

// F12
feature(
  16,
  'F12',
  'Mesh Bench + Evidence Firewall',
  'Measure accuracy.\nDefend the pipeline.',
  'Frozen benchmarks expose retrieval and verdict failures. The evidence firewall treats pages, OCR and documents as untrusted input.',
  (s) => {
    mono(s, 'QUALITY BEFORE SCALE', 0.68, 4.73, 4.6, 0.25, 10, C.green);
    tx(
      s,
      'Abstention, citation exactness and calibration are first-class metrics.',
      0.68,
      5.14,
      5.24,
      0.88,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 7.01, 1.06, 5.51, 5.38, C.forest, C.line, 0.18);
    mono(s, 'MESH BENCH', 7.31, 1.34, 3.4, 0.22, 10, C.green);
    ['Citation exactness', 'Retrieval recall', 'Appropriate abstention'].forEach((a, i) => {
      tx(s, a, 7.31, 1.85 + i * 0.78, 3.0, 0.3, 13, C.white, { bold: true });
      pill(s, 'TRACKED', 10.91, 1.82 + i * 0.78, 1.16, C.dark, C.lime);
    });
    ln(s, 7.31, 4.4, 12.15, 4.4, C.line, 1);
    mono(s, 'EVIDENCE FIREWALL', 7.31, 4.7, 4.0, 0.22, 10, C.yellow);
    tx(
      s,
      'Untrusted source text cannot rewrite instructions, tools or scoring.',
      7.31,
      5.14,
      4.65,
      0.78,
      14,
      C.white,
      { bold: true },
    );
    mono(s, 'CONCEPT VISUAL — NO BENCHMARK RESULTS SHOWN', 7.1, 6.53, 5.3, 0.22, 8, C.muted);
  },
);

// 17 — gate, before F13
{
  const s = pptx.addSlide();
  bg(s, C.dark);
  photo(s, A('network-sculpture.png'), 0, 0, W, H);
  rect(s, 0, 0, 6.03, H, C.dark);
  rect(s, 5.85, 0, 0.5, H, C.dark);
  mono(s, 'THE NEXT FIVE CAPABILITIES', 0.68, 0.62, 6.0, 0.27, 11, C.green);
  tx(s, 'Gated pilots.\nBuilt on proof.', 0.68, 1.37, 6.75, 2.18, 55, C.white, {
    fontFace: 'Space Grotesk',
    bold: true,
  });
  tx(
    s,
    'We will pursue F13–F17 after the earlier capabilities are solid: evidence lineage, living versions, explicit policies, security and measurable quality.',
    0.72,
    4.33,
    5.69,
    1.51,
    19,
    C.soft,
    { valign: 'top' },
  );
  pill(s, 'PILOT SCOPE  /  NO AUTOMATIC HIGH-STAKES ACTIONS', 0.72, 6.38, 4.74, C.forest, C.lime);
  mono(s, 'MESH  /  INCUBATION', 0.67, 7.12, 3.0, 0.19, 8.5, C.muted);
  mono(s, '17  /  24', 11.9, 7.12, 0.78, 0.19, 8.5, C.muted, { align: 'right' });
}

// F13
feature(
  18,
  'F13',
  'Gated pilot · cases',
  'Auditable cases for\nreal-world decisions.',
  'Grant, DAO and narrowly defined insurance cases gather structured evidence and human review. The domain owner retains authority to approve or pay.',
  (s) => {
    mono(s, 'CASE OUTCOME  ≠  AUTOMATIC PAYOUT', 0.68, 4.75, 5.16, 0.25, 10, C.green);
    tx(
      s,
      'Missing records produce NEEDS INFO; disputes stay visible.',
      0.68,
      5.15,
      5.2,
      0.84,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 7.05, 1.12, 5.46, 5.34, C.forest, C.line, 0.18);
    mono(s, 'GRANT MILESTONE CASE', 7.35, 1.41, 3.6, 0.24, 10, C.green);
    tx(s, '100 kits delivered\nby the agreed date', 7.35, 1.95, 4.51, 0.98, 25, C.white, {
      fontFace: 'Space Grotesk',
      bold: true,
    });
    [
      ['Distribution logs', 'Received'],
      ['Beneficiary sample', 'Needs review'],
      ['Reviewer sign-off', 'Pending'],
    ].forEach((a, i) => {
      rect(s, 7.34, 3.26 + i * 0.72, 4.76, 0.57, C.dark, C.line, 0.1);
      tx(s, a[0], 7.56, 3.39 + i * 0.72, 2.8, 0.25, 12, C.white, { bold: true });
      tx(s, a[1], 10.25, 3.39 + i * 0.72, 1.55, 0.25, 10, i === 0 ? C.green : C.yellow, {
        align: 'right',
      });
    });
  },
);

// F14
feature(
  19,
  'F14',
  'Gated pilot · markets',
  'An outcome dossier,\nnot a betting oracle.',
  'Mesh can assemble timestamped evidence against rules locked before a market closes. An authorized oracle or jury still resolves and settles.',
  (s) => {
    mono(s, 'PRECOMMITTED RULES  /  DISPUTE WINDOW', 0.68, 4.75, 5.4, 0.25, 10, C.green);
    tx(
      s,
      'Ambiguous evidence escalates. A score never moves collateral.',
      0.68,
      5.15,
      5.26,
      0.84,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 7.11, 1.05, 5.36, 5.43, C.cream, C.cream, 0.18);
    mono(s, 'RESOLUTION SPECIFICATION', 7.41, 1.39, 4.5, 0.24, 10, C.gray);
    tx(s, 'Did company X announce Y\nbefore 23:59 UTC?', 7.41, 1.95, 4.55, 1.1, 25, C.ink, {
      fontFace: 'Space Grotesk',
      bold: true,
    });
    [
      ['Rule locked', 'Before trading'],
      ['Evidence as-of', 'Deadline bounded'],
      ['Counterevidence', 'Open during dispute'],
      ['Outcome', 'Indeterminate allowed'],
    ].forEach((a, i) => {
      ln(s, 7.39, 3.33 + i * 0.58, 12.0, 3.33 + i * 0.58, C.soft, 0.8);
      tx(s, a[0], 7.42, 3.41 + i * 0.58, 2.2, 0.27, 11.5, C.gray);
      tx(s, a[1], 9.7, 3.41 + i * 0.58, 2.3, 0.27, 11.5, C.ink, { bold: true, align: 'right' });
    });
  },
);

// F15
feature(
  20,
  'F15',
  'Gated pilot · bounties',
  'Reward the missing proof,\nnot the loudest opinion.',
  'A bounded evidence need invites verifiable submissions. Reviewers apply a published rubric, and accepted evidence creates a new Passport version.',
  (s) => {
    mono(s, 'PILOT: OFF-CHAIN FUNDING FIRST', 0.68, 4.74, 5.25, 0.25, 10, C.green);
    tx(
      s,
      'Payout follows review and dispute; links alone earn nothing.',
      0.68,
      5.15,
      5.14,
      0.84,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 7.12, 1.05, 5.32, 5.44, C.forest, C.line, 0.19);
    mono(s, 'EVIDENCE NEED  #127', 7.43, 1.36, 3.8, 0.22, 10, C.green);
    tx(s, 'Find the signed\noriginal notice.', 7.43, 1.95, 4.5, 1.12, 27, C.white, {
      fontFace: 'Space Grotesk',
      bold: true,
    });
    ln(s, 7.43, 3.24, 12.05, 3.24, C.line, 1);
    [
      ['Required origin', 'Agency domain'],
      ['Deadline', 'Before date Y'],
      ['Review', 'Independent adjudicator'],
    ].forEach((a, i) => {
      mono(s, a[0].toUpperCase(), 7.43, 3.59 + i * 0.6, 1.85, 0.2, 9, C.muted);
      tx(s, a[1], 9.35, 3.57 + i * 0.6, 2.54, 0.3, 12, C.white, { bold: true });
    });
    pill(s, 'SUBMISSION  →  REVIEW  →  AWARD', 7.43, 5.75, 3.82, C.green, C.ink);
  },
);

// F16
feature(
  21,
  'F16',
  'Gated pilot · zkTLS',
  'Prove a private source\nwithout surrendering it.',
  'For one supported portal and narrow predicate, a vetted zkTLS provider can verify source origin and a minimal disclosed value. Mesh never needs the full private record.',
  (s) => {
    mono(s, 'SOURCE ORIGIN  ≠  DATABASE TRUTH', 0.68, 4.74, 5.3, 0.25, 10, C.green);
    tx(
      s,
      'Unsupported sites fail clearly; credentials stay with the user.',
      0.68,
      5.13,
      5.26,
      0.85,
      16,
      C.white,
      { bold: true },
    );
    const parts = [
      ['PRIVATE PORTAL', 'User device'],
      ['PROOF', 'Vetted provider'],
      ['MESH', 'Minimal statement'],
    ];
    parts.forEach((a, i) => {
      const x = 7.08 + i * 1.86;
      rect(s, x, 2.01, 1.66, 2.34, i === 2 ? C.green : C.forest, i === 2 ? C.green : C.line, 0.2);
      mono(s, a[0], x + 0.18, 2.35, 1.36, 0.32, 9, i === 2 ? C.ink : C.green);
      tx(s, a[1], x + 0.18, 3.2, 1.31, 0.6, 14, i === 2 ? C.ink : C.white, { bold: true });
      if (i < 2) ln(s, x + 1.68, 3.18, x + 1.84, 3.18, C.green, 2);
    });
    mono(s, 'PROVIDER TRUST MODEL + FIELD BINDING ARE EXPLICIT', 7.1, 5.2, 5.4, 0.51, 9, C.muted);
  },
);

// F17
feature(
  22,
  'F17',
  'Gated pilot · Zero-Knowledge Passports',
  'Reveal only what\nthe decision needs.',
  'Selective disclosure proves included fields. A later true ZK pilot proves one bounded hidden predicate against a signed Passport root and policy.',
  (s) => {
    mono(s, 'TWO DIFFERENT CRYPTOGRAPHIC CLAIMS', 0.68, 4.73, 5.43, 0.25, 10, C.green);
    tx(
      s,
      'A valid proof verifies a commitment, not the source’s factual honesty.',
      0.68,
      5.13,
      5.29,
      0.86,
      16,
      C.white,
      { bold: true },
    );
    rect(s, 7.04, 1.08, 5.46, 5.35, C.forest, C.line, 0.19);
    mono(s, 'SIGNED PASSPORT ROOT', 7.38, 1.41, 3.8, 0.23, 10, C.green);
    rect(s, 7.38, 1.94, 4.8, 0.66, C.dark, C.line, 0.11);
    tx(s, '0x91a4…e82c', 7.63, 2.12, 3.4, 0.28, 16, C.white, {
      fontFace: 'Space Grotesk',
      bold: true,
    });
    rect(s, 7.38, 2.97, 4.8, 1.06, C.dark, C.line, 0.14);
    mono(s, 'SELECTIVE DISCLOSURE', 7.58, 3.16, 3.3, 0.2, 9, C.green);
    tx(s, 'Reveal chosen fields + Merkle proof', 7.58, 3.52, 4.2, 0.28, 12.5, C.white, {
      bold: true,
    });
    rect(s, 7.38, 4.29, 4.8, 1.31, C.dark, C.line, 0.14);
    mono(s, 'TRUE ZK PREDICATE PILOT', 7.58, 4.5, 3.55, 0.2, 9, C.yellow);
    tx(s, 'Prove policy condition without value', 7.58, 4.89, 4.19, 0.53, 12.5, C.white, {
      bold: true,
    });
  },
);

// 23 — whole system payoff, no timeline
{
  const s = newSlide(23, false);
  mono(s, 'ONE NETWORK  /  MULTIPLE WAYS TO RELY', 0.67, 0.56, 8.0, 0.24, 11, C.gray);
  tx(s, 'The same evidence.\nDifferent decisions.', 0.67, 1.06, 9.6, 1.56, 46, C.ink, {
    fontFace: 'Space Grotesk',
    bold: true,
  });
  tx(
    s,
    'Every surface points back to the claim, the exact evidence, the method and the version that existed when someone acted.',
    0.68,
    2.91,
    6.4,
    1.1,
    18,
    C.gray,
    { valign: 'top' },
  );
  const a = [
    ['PERSON', 'Should I share this?'],
    ['DEVELOPER', 'Can I reuse this Passport?'],
    ['AGENT', 'Does policy pass?'],
    ['INSTITUTION', 'Who reviewed the case?'],
  ];
  a.forEach((v, i) => {
    const x = 0.68 + (i % 2) * 6.3,
      y = 4.29 + Math.floor(i / 2) * 1.15;
    rect(s, x, y, 5.97, 0.93, i === 2 ? C.ink : C.white, i === 2 ? C.ink : C.soft, 0.16);
    mono(s, v[0], x + 0.2, y + 0.17, 1.63, 0.19, 9, i === 2 ? C.green : C.gray);
    tx(s, v[1], x + 1.8, y + 0.25, 3.88, 0.36, 15, i === 2 ? C.white : C.ink, { bold: true });
  });
}

// 24 — close
{
  const s = pptx.addSlide();
  bg(s, C.dark);
  photo(s, A('network-sculpture.png'), 0, 0, W, H);
  rect(s, 0, 0, 6.18, H, C.dark);
  rect(s, 5.9, 0, 0.53, H, C.dark);
  mono(s, 'MESH  ×  SIMAN LABS', 0.68, 0.6, 5.4, 0.25, 11, C.green);
  tx(s, 'Make evidence\nworth acting on.', 0.68, 1.48, 7.27, 2.1, 52, C.white, {
    fontFace: 'Space Grotesk',
    bold: true,
  });
  tx(
    s,
    'A living, inspectable and privacy-aware evidence network—built from a working product.',
    0.72,
    4.36,
    5.36,
    1.1,
    20,
    C.soft,
    { valign: 'top' },
  );
  pill(s, 'LIVE MVP', 0.72, 6.18, 1.34, C.green, C.ink);
  tx(s, 'ai3-hack.oluwadunsin.dev', 2.25, 6.22, 3.8, 0.29, 13, C.white, { bold: true });
  mono(s, 'MESH  /  INCUBATION', 0.68, 7.1, 3, 0.2, 8.5, C.muted);
  mono(s, '24  /  24', 11.9, 7.1, 0.78, 0.2, 8.5, C.muted, { align: 'right' });
}

pptx.writeFile({ fileName: path.join(__dirname, 'mesh-incubation-deck.pptx') });
