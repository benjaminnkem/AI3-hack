# One-Shot Build Prompt: Mesh Frontend

Paste this prompt into Codex or Claude Code from the root of the existing Turborepo after the backend API is implemented. Place `MESH_PRD.md` in the repository first, preferably at `docs/MESH_PRD.md`.

---

You are the principal frontend engineer and product designer responsible for completing the Mesh web application inside this existing Turborepo.

This is an implementation task. Do not stop after planning, wireframes, component suggestions, or static mockups. Inspect the repository and actual backend API, build the complete frontend, run validation and browser tests, fix failures, and leave a polished runnable application.

## Source of truth

1. Find and read `MESH_PRD.md`, preferably at `docs/MESH_PRD.md`.
2. Inspect the repository root, package manager, Turbo config, lint/TypeScript setup, and `apps/web` before changing anything.
3. Inspect the actual backend Swagger/OpenAPI document, controllers, DTOs, response envelope, and Evidence Passport response types. Do not invent endpoints or fields that disagree with the implemented backend.
4. Preserve existing working design-system and framework conventions. If `apps/web` is empty, use Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Framer Motion, and Lucide icons.
5. The PRD defines the product experience. The actual backend implementation defines the final wire contract.

## Repository boundary

Focus on `apps/web` and only the minimum root changes required for shared scripts or Turbo tasks. Do not rewrite the backend or contract. When a backend mismatch blocks the frontend, document it clearly and adapt only when correctness is preserved.

## Product goal

Build a credible decentralized evidence application, not a generic chat UI and not a crypto-casino landing page.

A user must be able to:

1. Submit text, a URL, or an image.
2. Understand that verification may take time.
3. Receive a complete Evidence Passport.
4. See atomic claims and supporting/opposing evidence.
5. Compare Kimi and MiniMax.
6. See disagreement and adversarial challenges.
7. Inspect Gonka response IDs and integrity hashes.
8. Open the Base Sepolia transaction and contract.
9. run an integrity check.
10. share the passport or copy an embed badge.
11. browse recent public passports.

## Mandatory pages

Implement:

- `/` — landing page plus verification composer and recent passports
- `/verify` — either a dedicated verification page or a redirect/alias to the main composer
- `/p/[publicId]` — full public Evidence Passport
- `/explore` — paginated/filterable public passport explorer
- `/badge/[publicId]` — compact iframe-safe badge
- `/about` — how the protocol works
- a useful `not-found` page and route-level error/loading states

## Visual direction

Create a modern, high-trust AI/Web3 interface:

- near-black/charcoal background
- warm off-white text
- restrained emerald/green accent for verified integrity and supported results
- amber for uncertainty and disagreement
- red only for contradicted states and errors
- subtle mesh/grid motif
- elegant typography and generous whitespace
- clear data hierarchy
- rounded cards with thin borders and restrained glow
- no loud gradients, token-price imagery, coins, rockets, or fake Web3 dashboards
- responsive and accessible

Support light mode only if the existing app already has it; otherwise finish one excellent dark theme rather than two incomplete themes.

## Landing page

Build a memorable hero:

- Mesh name and tagline
- one-sentence product explanation
- live verification composer immediately visible
- small indicators: “Multi-model”, “Live evidence”, “On-chain receipt”

Below it, include:

- a three/four-step “How it works” section
- a visual explanation of an Evidence Passport
- recent passport cards from the API
- a protocol/integration section explaining REST API and embeddable badges
- a concise footer with Gonka and Base Sepolia attribution

Do not hardcode fake passport results as if they were real. Empty states and explicit demo examples are acceptable.

## Verification composer

Create accessible tabs for:

- Text
- URL
- Image

Text requirements:

- textarea
- character count
- clear example-fill action
- validation up to backend limit

URL requirements:

- URL input
- explain support for articles and social-post URLs
- strict client validation while allowing the backend to make the final decision

Image requirements:

- drag-and-drop and file picker
- PNG/JPEG/WebP
- 5 MB limit
- preview, remove, and replace
- no direct upload secrets in the client

Submission requirements:

- use the backend’s actual JSON/multipart format
- disable duplicate submission
- show a staged processing experience explaining normalization, claim extraction, live evidence, model investigations, consensus, passport hashing, and attestation
- because the MVP backend call may be synchronous, treat these stages as explanatory processing animation unless real stage telemetry is available
- make long waits feel intentional
- support cancellation through AbortController
- on success, navigate to `/p/[publicId]`
- on error, show a human-readable message, trace ID when available, and retry action

## Public Evidence Passport page

This is the most important screen. It must feel like a reusable digital artifact.

Header:

- passport public ID
- version
- generated timestamp
- input type
- copy link
- Truth Score gauge
- verdict badge
- confidence score
- attestation status

Summary:

- concise explanation
- safe input preview
- original source link when applicable

Atomic claims:

- one card per claim
- claim score, confidence, verdict, and importance
- expandable reasoning summary
- associated evidence counts

Evidence:

- tabs or filters for supporting, opposing, and neutral
- title, domain, publication date, retrieval date, short excerpt
- relevance and source-quality indicators with tooltips
- safe external links
- group evidence under the correct claim
- clear empty states

Model comparison:

- side-by-side Kimi and MiniMax cards
- exact model names
- score, confidence, verdict suggestion, concise reasoning summary
- agreement meter
- highlighted disagreement statements
- Gonka response IDs with copy controls

Adversarial review:

- challenge, severity, resolved state, and resolution
- visually distinct from normal evidence
- explain that the system attempts to disprove its leading result

Integrity and Web3:

- passport hash
- input hash
- claims root
- evidence root
- model-output hashes
- request-ID hash
- copy buttons and abbreviated display
- contract address
- chain ID and Base Sepolia name
- transaction hash and block number
- attestor
- explorer links
- “Verify integrity” button calling the real endpoint
- field-by-field verification results and final valid/invalid state
- do not require wallet connection because the backend performs the attestation

Sharing:

- copy public URL
- native share when supported
- copy iframe badge code such as `<iframe src=".../badge/{publicId}">`
- optional downloadable JSON using already returned passport data; do not generate a misleading PDF certificate

Disclaimer:

- state clearly that the score is based on available evidence and model consensus, not absolute truth or professional advice

## Explorer page

Use the real cursor-paginated endpoint.

- filters for verdict and input type
- date sorting/filter when supported
- search only if the backend provides it; do not pretend local filtering is global search
- responsive passport cards/table
- score, verdict, input preview, generated date, and attestation status
- loading, empty, error, and next-page states

## Badge route

Build an iframe-safe compact badge:

- no full site navigation
- Mesh name
- verdict
- score
- generated date
- integrity/attestation indicator
- link target to full public passport
- compact responsive dimensions
- gracefully render missing/failed data

## Data layer

- Put the API base URL in `NEXT_PUBLIC_API_BASE_URL`.
- Build one typed API client with timeout, abort support, envelope parsing, and normalized errors.
- Use TanStack Query for server state and mutations.
- Use actual backend response types. If OpenAPI generation is already available, generate types rather than manually duplicating them. Otherwise create strict local interfaces that exactly mirror the backend.
- Do not put Gonka, Tavily, Cloudinary secret, RPC signer, database, or private-key variables in the web app.
- Do not proxy the long-running verification through a Vercel route handler unless there is a clear reason; call the configured backend URL from the browser.

## Accessibility and quality

- semantic headings and landmarks
- keyboard-operable tabs, accordions, dialogs, and copy actions
- visible focus states
- accessible labels and error descriptions
- sufficient contrast
- reduced-motion support
- screen-reader text for gauges and icons
- no score conveyed by color alone
- sanitize or render all untrusted content as text, never arbitrary HTML
- external links use safe attributes

## SEO and metadata

- global metadata for Mesh
- dynamic metadata for passport pages using safe summary text
- Open Graph/Twitter metadata where practical
- noindex the badge route if appropriate
- proper favicon/app icon if one already exists or create a simple text/mesh mark without blocking implementation

## Tests

Create and run tests appropriate to the existing setup. At minimum:

### Unit/component tests

- form validation for text, URL, and image
- API error normalization
- score gauge and verdict mapping
- evidence filtering
- integrity result display
- copy/share behavior where testable

### Playwright E2E

Use API mocking for deterministic CI tests:

- submit a text claim and navigate to passport
- submit invalid URL
- reject oversized/invalid image
- render complete passport
- render model disagreement
- run integrity verification
- copy badge code
- explore pagination/filter
- mobile viewport smoke test

Also provide one optional real-backend Playwright smoke test gated by environment variables.

Use stable selectors based on role, label, or `data-testid` only where necessary.

## Environment and documentation

Create `apps/web/.env.example` with every required public variable and comments. Update the web README with:

- prerequisites
- environment setup
- local run command
- backend dependency
- production build
- Vercel deployment
- configuring backend CORS with the deployed web origin
- testing commands
- real-flow smoke test
- troubleshooting CORS, API timeout, image upload, missing passport, and explorer-link issues

## Validation behavior

Run the repository’s real equivalents of:

- formatting check
- lint
- typecheck
- component/unit tests
- Playwright tests
- production build

Use the Playwright MCP server if it is available to inspect the live app at desktop and mobile sizes. Do not claim visual validation occurred unless you actually ran it.

Fix issues caused by your changes. Do not stop at the first error.

## Rules

- Do not ask me to create ordinary files that you can create.
- Do not return only a design description.
- Do not use fake production data or hardcoded successful verification results.
- Do not expose secrets in `NEXT_PUBLIC_` variables.
- Do not add authentication, wallet connection, token balances, payments, or unrelated Web3 features.
- Do not rewrite unrelated repository code.
- Do not leave required components as TODOs.
- Favor a small number of polished screens over many unfinished pages.

## Required final response

After implementation, report:

1. Pages and user flows built.
2. Important UI/UX and architecture decisions.
3. Files added or materially changed.
4. The actual backend endpoints/types used.
5. Every required environment variable and where to set it.
6. Exact local run, test, build, and Vercel deployment commands.
7. Tests and builds actually run with results.
8. Any browser/MCP validation performed.
9. External steps I still need to complete.
10. Honest remaining limitations.

Begin by reading the PRD and inspecting the actual backend API, then implement the complete frontend now.
