# Mesh incubation pitch deck

A 14-slide deck for the SIMAN LABS incubation meeting. It leads with the working product (real screenshots and a real passport), then trust, then a one-slide roadmap, then the incubation ask.

## Files

- `deck/index.html`: **source of truth**. Present it in a browser (arrow keys / click; `#7` jumps to slide 7). Edit text here.
- `mesh-incubation-deck.pdf`: presenting / sharing copy (best fidelity).
- `mesh-incubation-deck.pptx`: slide images with speaker notes, for PowerPoint / Google Slides. **Not text-editable.**
- `speaker-notes.md`: talk track per slide (also embedded in the PPTX notes).
- `previews/`: per-slide PNGs.
- `assets/`: editorial images and real screenshots of the running app (`shot-*.png`). `fonts/`: Space Grotesk, Inter, JetBrains Mono.
- `build-deck.cjs`: renders slides with headless Chrome and builds PDF/PPTX/notes.

## Rebuild

```sh
node docs/pitch/build-deck.cjs   # needs Google Chrome (or set CHROME_BIN)
```

## Content boundaries

- Slides 3–11 describe shipped behaviour. Slide 12 is a **proposed** roadmap (F01–F17 condensed); slide 13's ask is a draft to confirm.
- Screenshots come from a local run against real Gonka, Tavily and Sepolia (passport `pm_gUTTfg0wdeKA`, tx confirmed in Sepolia block 11,891,382). Model names are intentionally not shown on slides.
- No traction, user or timeline claims are made.
