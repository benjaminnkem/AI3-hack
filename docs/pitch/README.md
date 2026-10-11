# Mesh incubation pitch deck

An editable 24-slide PowerPoint for SIMAN LABS. It opens with Mesh and the existing MVP, then presents F01–F17 one capability per slide. A dedicated gate slide appears immediately before F13–F17. The deck contains no timeline or traction claims.

## Files

- `mesh-incubation-deck.pptx` — editable deck
- `mesh-incubation-deck.pdf` — presentation and sharing copy
- `previews/contact-sheet.png` and `previews/slide-01.png` through `slide-24.png` — visual QA previews
- `slide-text.md` — extracted text for accessibility and content QA
- `build-deck.cjs` — PptxGenJS source
- `assets/` — two generated editorial images and Mesh's existing brand visual

## Rebuild

From the repository root:

```sh
node docs/pitch/build-deck.cjs
FONTCONFIG_FILE=/opt/homebrew/etc/fonts/fonts.conf python .agents/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf --outdir docs/pitch docs/pitch/mesh-incubation-deck.pptx
pdftoppm -png -r 100 docs/pitch/mesh-incubation-deck.pdf docs/pitch/previews/slide
```

The editable deck uses **Space Grotesk** for display type and **Avenir Next** for body type; both are installed on this Mac. The `FONTCONFIG_FILE` setting is required for the bundled LibreOffice PDF export to use these fonts rather than substitute them.

## Content boundaries

- The MVP slide describes verified existing product behavior. The F01–F12 slides are labelled **Proposed**. The F13–F17 slides are labelled **Gated pilot**.
- The feature scenes are concept visuals, not screenshots of completed features. The Mesh landing image is an existing repository brand asset.
- The deck distinguishes evidence assessment, source provenance, cryptographic integrity, private proof and factual correctness.
- The F12 concept visual contains no benchmark numbers. The F09 slide presents “Before You Share” as a proposed wedge that still needs owner confirmation.

## Generated image prompts

Built-in imagegen tool, without an API key:

1. `research-editorial.png`: wide cinematic editorial photograph of a researcher examining a claim and multiple sources at a dark desk, Mesh emerald accents, left-side negative space, no text or logos.
2. `network-sculpture.png`: wide abstract glass-fiber evidence network in deep forest darkness, luminous emerald connections around a central node, left-side negative space, no text or logos.

The external visual references supplied by the owner informed typography, contrast and pacing; their image files are not embedded in the deck.
