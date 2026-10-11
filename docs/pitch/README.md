# Mesh SuperStar incubation deck

A 28-slide proposal deck for the SIMAN Labs SuperStar incubation. The audience is deciding whom to back, so it proves delivery first, then proposes what Mesh builds next.

## Structure

1. Cover, problem, **proof (slides 3 and 4: working product, real passport, real Sepolia receipt)**
2. The proposal: product shift, then F01 to F12 one per slide, a gated-pilots divider, F13 to F17 (content follows `docs/Mesh_Incubation_Full_Agent_Specification.md`)
3. The demo we will deliver, a relative-week roadmap, delivery gates, business model (hypotheses), the ask

## Files

- `deck/index.html`: **source of truth**. Present it in a browser (arrow keys or click; `#7` jumps to slide 7). Edit text here.
- `mesh-incubation-deck.pdf`: presenting and sharing copy.
- `mesh-incubation-deck.pptx`: slide images with speaker notes (not text-editable).
- `speaker-notes.md`: talk track per slide.
- `previews/`: per-slide PNGs. `assets/`: images and real app screenshots. `fonts/`: Space Grotesk, Inter, JetBrains Mono.
- `build-deck.cjs`: renders slides with headless Chrome and builds the PDF, PPTX and notes.

## Rebuild

```sh
node docs/pitch/build-deck.cjs   # needs Google Chrome, or set CHROME_BIN
```

## Content boundaries

- Slides 3 and 4 describe shipped behaviour. Everything from slide 5 on is **proposed** unless marked otherwise; F13 to F17 are gated pilots.
- The roadmap uses relative weeks from the spec and must be adjusted to the real incubation calendar. Delivery gates are proposed targets, not performance claims. The business model is hypotheses, not verified demand.
- Screenshots come from a local run against real Gonka, Tavily and Sepolia (passport `pm_gUTTfg0wdeKA`, tx confirmed in Sepolia block 11,891,382). Model names are intentionally not shown.
- No traction, user or partnership claims are made. The ask on slide 28 is a draft to confirm.
