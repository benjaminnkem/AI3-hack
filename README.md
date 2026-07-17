# Mesh

![Mesh landing page](docs/assets/mesh-landing.webp)

**A decentralized evidence passport for every digital claim.**

Mesh was built for **AI³ Growth Hackathon: Ship with AI**, **Track 3: Gonka: AI for Society**, sponsored by **Gonka**.

Mesh transforms URLs, social posts, text claims, screenshots, and images into portable Evidence Passports. The implemented pipeline uses Tesseract.js for English OCR, Tavily Extract to read submitted public URLs, Tavily Search to retrieve current sources that investigators classify as supporting, opposing, or contextual evidence, Gonka Router for every LLM inference and verification-reasoning stage, deterministic application code for the 0–100 Truth Score, and Ethereum Sepolia for compact tamper-evident attestations.

[![AI³ Growth Hackathon](https://img.shields.io/badge/AI%C2%B3_Growth_Hackathon-Ship_with_AI-22e59a?style=flat-square)](https://ai3-hack.oluwadunsin.dev)
![Track 3](https://img.shields.io/badge/Track_3-Gonka%3A_AI_for_Society-22e59a?style=flat-square)
[![Gonka Router](https://img.shields.io/badge/AI-Gonka_Router-22e59a?style=flat-square)](https://gonkarouter.io/)
[![Tavily](https://img.shields.io/badge/Web_Data-Tavily-22e59a?style=flat-square)](https://tavily.com/)
![Multi-model consensus](https://img.shields.io/badge/verification-multi--model_consensus-22e59a?style=flat-square)
![Tesseract.js OCR](https://img.shields.io/badge/OCR-Tesseract.js-22e59a?style=flat-square)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square)
![Ethereum Sepolia](https://img.shields.io/badge/Ethereum-Sepolia-627eea?style=flat-square)
[![Live Demo](https://img.shields.io/badge/Live-Demo-22e59a?style=flat-square)](https://ai3-hack.oluwadunsin.dev)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Mesh_Bot-229ed9?style=flat-square)](https://t.me/mesh_passport_bot)
[![API Docs](https://img.shields.io/badge/API-Swagger_Docs-85ea2d?style=flat-square)](https://ai3-hack-be.oluwadunsin.dev/docs)

| Try Mesh                  | Link                                                      |
| ------------------------- | --------------------------------------------------------- |
| Live application          | [Open Mesh](https://ai3-hack.oluwadunsin.dev)             |
| Telegram verification bot | [Open @mesh_passport_bot](https://t.me/mesh_passport_bot) |
| Backend API documentation | [Open Swagger](https://ai3-hack-be.oluwadunsin.dev/docs)  |
| Demo video                | [Open Mesh Demo](CLOUDINARY_DEMO_VIDEO_URL)               |

> A Mesh Truth Score is a transparent confidence assessment based on the evidence available at verification time. It is not a declaration of absolute truth.

## Table of Contents

- [Project Overview](#project-overview)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Why Mesh](#why-mesh)
- [Product Story](#product-story)
- [AI³ Growth Hackathon — Gonka: AI for Society](#hackathon-alignment)
- [Features](#features)
- [Architecture](#architecture)
- [OCR and Image Verification](#ocr-and-image-verification)
- [Tavily URL Extraction and Evidence Retrieval](#tavily-url-extraction-and-evidence-retrieval)
- [Gonka Router and Multi-Model Analysis](#gonka-router-and-multi-model-analysis)
- [Truth Score and Consensus](#truth-score-and-consensus)
- [Evidence Passports](#evidence-passports)
- [Ethereum Sepolia Attestation](#ethereum-sepolia-attestation)
- [Telegram Bot](#telegram-bot)
- [Technical Architecture and Stack](#technical-architecture-and-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites and Environment](#prerequisites-and-environment)
- [Local Development](#local-development)
- [Smart Contract Setup](#smart-contract-setup)
- [Telegram Setup](#telegram-setup)
- [API](#api)
- [Testing](#testing)
- [Judge Demo Flow](#judge-demo-flow)
- [Deployment](#deployment)
- [Security, Privacy, and Trust](#security-privacy-and-trust)
- [Limitations](#limitations)
- [Roadmap](#roadmap)
- [Contributing and License](#contributing-and-license)
- [Acknowledgements](#acknowledgements)

<!--
Landing page screenshot:
Add docs/assets/mesh-landing.webp, then uncomment:

-->

The live product is available at [ai3-hack.oluwadunsin.dev](https://ai3-hack.oluwadunsin.dev).

<!--
Demo video setup:
1. Add docs/assets/mesh-demo-thumbnail.webp
2. Replace CLOUDINARY_DEMO_VIDEO_URL with the final Cloudinary URL
3. Uncomment the linked image
-->

[![Watch the Mesh demo](docs/assets/mesh-demo-thumbnail.webp)](CLOUDINARY_DEMO_VIDEO_URL)
**Watch the Mesh demo** ([Demo Video](CLOUDINARY_DEMO_VIDEO_URL))

## Project Overview

Mesh is a decentralized trust and evidence layer for people, communities, applications, and AI agents. It turns a digital input into a reusable Evidence Passport: a public record of the atomic claims found, current evidence collected, independent model assessments, disagreement, score derivation, integrity hashes, and optional blockchain receipt.

The product serves ordinary users checking a forwarded screenshot, journalists auditing sources and dates, communities discussing disputed posts, developers consuming the REST API, and AI agents that need a portable trust artifact instead of repeating an investigation from zero.

Mesh is more than a generic fact-checking page because its result is designed to travel. A passport can be shared through its public page, rendered as a compact badge, retrieved through the API, rechecked against stored hashes, and compared with an Ethereum Sepolia attestation. The chain makes later modification detectable; it does not decide whether a claim is true.

For URL inputs, Mesh does not evaluate a title or URL string alone. Tavily Extract retrieves the readable page content before atomic claims are generated, and Tavily Search then gathers independent evidence about those claims.

## The Problem

AI-assisted misinformation can move rapidly between X, Telegram, WhatsApp, Discord, screenshots, blogs, and news sites. Platform-specific fact-checks do not travel with the claim, so each new audience may restart the same investigation. Screenshots can hide the source, and text embedded in an image is slow to inspect or search manually.

Single-model answers introduce another failure mode: one provider's blind spots, confidence, or bias can be mistaken for certainty. A single summary often hides disagreement, incomplete evidence, and the difference between “not supported” and “contradicted.” Centralized results can also change without an independently inspectable receipt.

Mesh addresses this public-value gap with an artifact that humans, applications, communities, and AI agents can inspect and reuse.

## The Solution

The current backend executes this flow synchronously and can stream real stage updates as newline-delimited JSON:

```text
User submits text, a public URL/social-post URL, or a PNG/JPEG/WebP image
  -> the input is validated, normalized, and hashed
  -> public URLs pass HTTP(S), DNS, and SSRF safety checks
  -> Tavily Extract reads the submitted page content
  -> Tavily Search is used as the URL-ingestion fallback if extraction fails or is empty
  -> images are stored and Tesseract.js extracts English text
  -> Kimi normalizes the OCR transcript as text through Gonka Router
  -> normalized text enters MiniMax claim extraction through Gonka Router
  -> Tavily Search runs claim-specific queries for current evidence
  -> a contradiction-oriented query is also considered within the configured query cap
  -> investigators classify evidence as supporting, opposing, or neutral
  -> Kimi and MiniMax investigate the same claims and evidence independently in parallel
  -> Kimi performs an adversarial review of both assessments
  -> application code computes per-claim and overall Truth Scores
  -> MiniMax writes a narrative that cannot alter the computed result
  -> Mesh creates the canonical Evidence Passport, Keccak-256 hashes, and Merkle roots
  -> PostgreSQL stores the investigation and passport
  -> compact values are optionally attested through MeshAttestationRegistry
  -> the public passport, badge, API response, and integrity check become reusable
```

If no independently verifiable factual claim is found, Mesh returns an `UNVERIFIED` passport with a score of 50 and confidence of 0 instead of inventing claims. If structured AI output remains invalid after one repair call, the pipeline fails honestly.

## Why Mesh

- Verification should be portable across platforms and conversations.
- No single AI model should define truth.
- Supporting, opposing, and neutral evidence should remain inspectable.
- Model disagreement should stay visible.
- Screenshot and image text should enter the same evidence pipeline through OCR.
- Repeated exact inputs should be able to reuse a recent passport.
- Humans, applications, and AI agents should inspect the same artifact.
- Private content, full evidence, reasoning, and images should not be stored on-chain.
- Blockchain should provide integrity and timestamping, not financial speculation or factual authority.

## Product Story

Mesh was created for the moment when a claim no longer arrives as a clean article. It may be copied into a group, forwarded through Telegram, or flattened into a screenshot with its origin missing. Tesseract.js makes the written content searchable again; live retrieval reconnects that content to current sources.

Two independent Gonka-routed investigators are preferable to trusting one model because agreement and disagreement both carry useful information. A deterministic score keeps the final number in auditable application code. Ethereum Sepolia then anchors compact integrity values—not user content—so the passport can carry an independently inspectable receipt without turning verification into a token product. Telegram brings the same workflow closer to where forwarded claims are actually encountered.

<a id="hackathon-alignment"></a>

## AI³ Growth Hackathon — Gonka: AI for Society

Mesh was built for **AI³ Growth Hackathon: Ship with AI**, **Track 3: Gonka: AI for Society**, sponsored by **Gonka**. The track asks builders to use decentralized inference to create inclusive and trustworthy public-interest AI systems that address misinformation, manipulated media, centralized platform bias, and concentrated AI infrastructure.

| Track requirement                     | Mesh implementation                                                                                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All AI inference through Gonka Router | A single NestJS `GonkaClient` wraps the official Anthropic SDK with `https://api.gonkarouter.io`; every inference stage calls it.                                                              |
| Multi-model cross-consensus           | `moonshotai/Kimi-K2.6` and `MiniMaxAI/MiniMax-M2.7` independently assess the same claims and evidence. Kimi also challenges the leading result; consensus scoring is deterministic code.       |
| URL verification                      | Mesh validates HTTP(S), resolves DNS, blocks private/unsafe targets, reads content with Tavily Extract, and falls back to Tavily Search on failed or empty extraction before claim extraction. |
| Text and social-post verification     | Text up to the backend's 10,000-character limit is normalized directly. Social posts are supported as public URLs when Tavily can access their content.                                        |
| Image and screenshot verification     | PNG, JPEG, and WebP files up to 5 MiB are processed with English Tesseract.js OCR. Gonka currently receives the OCR transcript, not a native image block.                                      |
| Real-time evidence                    | Tavily Search runs claim-specific and contradiction-oriented query candidates; returns titles, URLs, domains, excerpts, dates, and relevance; and deduplicates canonical URLs/domains.         |
| 0–100 Truth Score                     | The backend combines evidence balance, source coverage, both model probabilities, disagreement, confidence, source quality, and unresolved adversarial penalties using a fixed formula.        |
| Traceable reasoning                   | Passports expose atomic claims, evidence direction and metadata, per-model summaries, challenges, disagreement, verdicts, and scores.                                                          |
| Gonka Request IDs                     | Response body IDs and optional header IDs are persisted in `model_responses`; public model cards show an audit ID and `requestIdsHash` commits all stored stage IDs.                           |
| Transparent UI                        | The [live Mesh application](https://ai3-hack.oluwadunsin.dev) renders public passports, evidence, model comparisons, integrity values, and receipts.                                           |
| Public social value                   | The web app, REST API, public passport pages, badges, and Telegram bot serve users, journalists, communities, developers, and agents.                                                          |
| On-chain attestation                  | `MeshAttestationRegistry` stores compact hashes, score, version, timestamp, and attestor on Ethereum Sepolia.                                                                                  |
| Telegram accessibility                | The live [Mesh Telegram bot](https://t.me/mesh_passport_bot) accepts text, URLs, photos, and supported image documents.                                                                        |

## Features

### Verification inputs

- Plain-text claims and paragraphs
- Public HTTP(S) URLs, including accessible social-post URLs
- PNG, JPEG, and WebP screenshots/images up to 5 MiB
- Exact-input reuse for recent passports and force-refresh versioning through the API

### OCR and evidence analysis

- English text extraction with Tesseract.js
- Neutral OCR-transcript normalization through Kimi
- Zero-to-five atomic factual claims through MiniMax
- Public URL content extraction with Tavily Extract
- Tavily Search fallback when extraction fails or returns no readable content
- Live, claim-specific Tavily Search queries
- A contradiction-oriented query candidate, subject to the configured per-claim query cap
- Supporting, opposing, and neutral classification after investigator assessment
- Canonical URL and domain deduplication
- Source titles, URLs, domains, excerpts, publication/retrieval dates, relevance, and model-derived quality values

### Decentralized AI

- All inference routed through Gonka Router
- Parallel Kimi and MiniMax investigators
- Kimi adversarial review
- MiniMax final narrative constrained by the deterministic result
- Visible model disagreement and concise reasoning summaries
- Gonka response/request audit metadata
- Zod validation and one model-mediated repair attempt

### Evidence Passport and Web3

- `SUPPORTED`, `UNVERIFIED`, `MISLEADING`, or `CONTRADICTED` verdict
- 0–100 Truth Score and confidence score
- Public passport and iframe-safe badge routes
- Keccak-256 roots and hashes with integrity recomputation
- Ethereum Sepolia transaction receipt and Etherscan links
- Attestation retry when blockchain publication fails

### Interfaces

- Next.js web application
- NestJS REST API with Swagger
- Telegram bot using the same backend pipeline
- Public passport explorer and history views

## Architecture

```mermaid
flowchart TD
    W["Next.js Web App"] --> API["NestJS API"]
    T["Telegram Bot"] --> API

    API --> V["Validation, normalization, input hash"]
    V -->|"public URL"| SAFE["HTTP(S), DNS + SSRF guard"]
    SAFE --> EXTRACT["Tavily Extract"]
    EXTRACT --> CONTENT["Normalized page content"]
    EXTRACT -->|"failed or empty"| SEARCH_FALLBACK["Tavily Search fallback"]
    SEARCH_FALLBACK --> CONTENT
    V -->|"image"| S["Local or Cloudinary storage"]
    V -->|"image"| O["Tesseract.js OCR (English)"]
    O --> VN["Kimi transcript normalization via Gonka"]

    CONTENT --> C["MiniMax atomic claim extraction via Gonka"]
    VN --> C
    V -->|"text"| C
    C --> E["Tavily Search for live claim evidence"]
    E --> KI["Kimi independent investigator via Gonka"]
    E --> MI["MiniMax independent investigator via Gonka"]
    KI --> A["Kimi adversarial review via Gonka"]
    MI --> A
    A --> D["Deterministic consensus + Truth Score"]
    D --> N["MiniMax constrained narrative via Gonka"]
    N --> P["Canonical Evidence Passport"]
    P --> DB[("PostgreSQL")]
    P --> H["Keccak-256 hashes + Merkle roots"]
    H --> SC["MeshAttestationRegistry"]
    SC --> ETH["Ethereum Sepolia · 11155111"]
    P --> PUB["Public passport, badge, API, integrity response"]
```

The API owns orchestration and external credentials. The web app and Telegram bot are clients; neither reimplements verification nor receives Gonka, Tavily, database, Cloudinary secret, or signer credentials.

## OCR and Image Verification

Mesh uses `tesseract.js` 7 in `apps/api`. OCR runs server-side so the same image path works for the browser and Telegram bot.

```text
Uploaded image or screenshot
  -> Multer memory upload and 5 MiB limit
  -> MIME validation: image/png, image/jpeg, or image/webp
  -> store locally or upload to Cloudinary
  -> Tesseract.js recognizes English text (`eng`)
  -> normalize line endings and trim the transcript
  -> Kimi neutrally structures the transcript through Gonka
  -> atomic claim extraction, Tavily evidence, independent analysis, scoring
  -> Evidence Passport retains an image URL and safe text preview
```

Current OCR behavior is intentionally specific:

- OCR language is hard-coded to English (`eng`). No multilingual selector exists.
- No rotation correction, thresholding, resizing, denoising, or other image preprocessing is implemented.
- Tesseract confidence is written to the API log, but it is not persisted, shown in the passport, or used in scoring.
- The user sees the resulting passport input preview, but there is no separate OCR-review/edit/confirm step before claim extraction.
- The original upload is retained in `UPLOAD_DIR` for local storage or in the configured Cloudinary folder for cloud storage. No automatic deletion policy is implemented.
- The OCR-derived normalized content is stored on the verification record; it is never written to the smart contract.
- If Tesseract throws, the service logs the failure and returns an empty transcript. The later structured stages may yield a no-claims passport or fail honestly; the API does not fabricate extracted text.
- The current Gonka flow sends OCR text to Kimi because native image content blocks were rejected during integration. It does not perform image forensics or deepfake detection.

OCR extracts written content. Tavily finds current sources. Gonka-routed models analyze claims and evidence. None of those operations proves that an image is unmanipulated.

### OCR local smoke test

1. Start PostgreSQL and the API.
2. Upload a clear PNG/JPEG/WebP screenshot containing a short English factual claim.
3. Confirm the API log contains `ocr.complete`, a character count, and a confidence value.
4. Confirm the public passport has input type `IMAGE`, an image URL, and an extracted-text preview.
5. Confirm the same normalized text reaches claim extraction and the normal evidence pipeline.
6. Try an unreadable image and confirm Mesh returns a no-claims result or a useful pipeline error rather than invented OCR text.

Tesseract worker/language resources are managed by the Node library at runtime. The repository contains `apps/api/eng.traineddata`, but the current `Tesseract.recognize` call does not configure an explicit `langPath`; ensure the runtime can resolve/download language data and has enough memory for a full image worker.

## Tavily URL Extraction and Evidence Retrieval

Mesh uses `@tavily/core` for two separate retrieval jobs. Tavily is not an AI inference or verdict provider.

### Tavily Extract: URL ingestion

For a submitted URL, Mesh first normalizes it, permits only HTTP(S), removes credentials, fragments, and known tracking parameters, resolves its hostname, and rejects loopback, local, metadata, private, link-local, carrier-grade NAT, multicast, and other unsafe address ranges. Only then does Tavily Extract receive the URL.

Tavily Extract requests readable Markdown content using the configured `TAVILY_EXTRACT_DEPTH` (`basic` by default). Mesh trims the first result and caps normalized page content at 12,000 characters before Gonka-routed claim extraction. This lets Mesh identify claims inside the page instead of reasoning over the URL string or title alone.

If extraction throws or returns empty content, the ingestion service calls Tavily Search with the normalized URL as the query. It combines the fallback results' titles and excerpts into normalized input. The current implementation does not measure extraction quality beyond the presence of non-empty content, so it does not automatically fall back merely because an extraction is short or incomplete.

Extraction can fail or be incomplete when a site requires authentication, enforces a paywall or anti-bot controls, or renders important content only in unsupported client-side code. Social platforms frequently impose these restrictions.

### Tavily Search: evidence retrieval

After MiniMax extracts atomic claims and search queries through Gonka Router, Tavily Search retrieves candidate evidence for each claim. The implementation:

- uses `TAVILY_SEARCH_DEPTH` (`fast` by default) and up to `TAVILY_MAX_RESULTS_PER_CLAIM` results (`4` by default, configurable from 1–5);
- uses Tavily's `news` topic for date-sensitive claims and `general` otherwise;
- runs up to `TAVILY_MAX_QUERIES_PER_CLAIM` queries (`2` by default) with bounded concurrency;
- appends a `${claim} false OR misleading fact check` query candidate before applying that cap;
- requests no Tavily-generated answer and no raw page content;
- normalizes URLs and deduplicates by canonical URL and domain, both within a search response and across searches for the same claim;
- retains titles, URLs, domains, excerpts, optional publication dates, retrieval dates, and relevance values; and
- lets Kimi and MiniMax assess source quality and direction. Evidence is marked supporting or opposing only when both investigators agree; otherwise it remains neutral.

Because the contradiction-oriented candidate is appended after model-generated queries, it can be excluded when those earlier queries already fill the configured cap. The README therefore describes it as a candidate rather than guaranteeing that it runs for every claim.

> Tavily retrieves and extracts web information. It does not produce Mesh’s model verdicts or Truth Score. All LLM-based claim extraction, investigation, adversarial analysis, and narrative generation run through Gonka Router, while deterministic application code computes the final score.

Retrieved material is evidence input, not guaranteed fact. Search coverage depends on indexed and accessible sources; content can be incomplete, stale, duplicated, misleading, or contain prompt-injection text. Mesh preserves source metadata and model disagreement so reviewers can inspect those limits.

## Gonka Router and Multi-Model Analysis

Tavily handles page extraction and live web retrieval; Gonka Router handles every LLM inference stage.

The implementation uses the official `@anthropic-ai/sdk` with:

- Base URL: `https://api.gonkarouter.io`
- Endpoint selected by the SDK: `POST /v1/messages`
- Authentication: `GONKA_API_KEY` sent by the SDK as an API key; raw requests can use `x-api-key` or `Authorization: Bearer`
- Kimi: `moonshotai/Kimi-K2.6`
- MiniMax: `MiniMaxAI/MiniMax-M2.7`
- Output budgets: stage-specific values, all validated at 1,024 tokens or more

These values match the [official Gonka integration guide](https://gonkarouter.io/docs) and [live model list](https://gonkarouter.io/models).

| Stage                        | Model        | Implemented role                                                                                                                                        |
| ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OCR transcript normalization | Kimi-K2.6    | Converts OCR text and basic image metadata into a neutral visible-text/entity/date/number/logo/scene structure. It does not receive the original image. |
| Atomic claim extraction      | MiniMax-M2.7 | Produces zero-to-five checkable claims and search queries.                                                                                              |
| Independent investigation    | Kimi-K2.6    | Scores support probability/confidence and assesses evidence without seeing MiniMax's output.                                                            |
| Independent investigation    | MiniMax-M2.7 | Performs the same schema-compatible assessment independently.                                                                                           |
| Adversarial review           | Kimi-K2.6    | Challenges both completed assessments for weak sources, omitted context, date/entity mismatch, and contradictions.                                      |
| Final narrative              | MiniMax-M2.7 | Summarizes already-computed scores and may not change them.                                                                                             |

The client joins text response blocks, stores the response body `id` as `gonkaResponseId`, stores an optional `request-id`/`x-request-id` header separately, and records the model ID, token usage, latency, and retry count. Model records live in PostgreSQL. The public model comparison exposes one audit ID per model, while `requestIdsHash` commits the sorted set of all stage response IDs, including repair calls.

Every structured response is parsed from plain or fenced JSON and checked with Zod. On failure, Mesh makes one repair call through the same Gonka model with validation errors. A second invalid result aborts the pipeline. Transient `429` and `5xx` responses use bounded exponential backoff with jitter; `Retry-After` is honored up to 15 seconds. Defaults are one retry, a 2-second base, and a 120-second call timeout.

Internal prompts are deliberately not reproduced here. They request concise reasoning summaries, not hidden chain-of-thought.

## Truth Score and Consensus

Mesh does not treat majority voting as proof, and a final model does not choose the number. For each claim, application code computes:

1. `modelMean`: mean Kimi/MiniMax support probability.
2. `disagreement`: absolute difference between model probabilities.
3. Per-source weight: mean investigator quality (0–1) multiplied by Tavily relevance (0–1).
4. Evidence balance: weighted `+1` support, `-1` opposition, and `0` neutral.
5. Coverage adjustment: evidence moves away from 50 in proportion to `min(1, distinctDomains / 3)`.
6. Adversarial penalty: unresolved severities divided by 10 and capped at 20.
7. Claim score: `round(0.60 × evidenceScore + 0.40 × modelMean − adversarialPenalty)`, clamped to 0–100.
8. Confidence: 35% mean model confidence, 25% model agreement, 25% domain coverage, and 15% average source quality.

Claim results are weighted by importance (1–5) for the overall score and confidence.

|  Score | Verdict        |
| -----: | -------------- |
| 70–100 | `SUPPORTED`    |
|  50–69 | `UNVERIFIED`   |
|  25–49 | `MISLEADING`   |
|   0–24 | `CONTRADICTED` |

Evidence direction is only marked supporting/opposing when both investigators agree; otherwise it remains neutral. This makes disagreement reduce apparent certainty instead of being silently resolved.

## Evidence Passports

The public passport payload actually contains:

- schema version, public ID, verification ID, passport version, and generation time;
- input type, safe display text, source/image URL, and input hash;
- verdict, Truth Score, confidence score, and summary;
- atomic claim text, importance, per-claim scores/verdict/reasoning, and claim hash;
- evidence title, URL/domain, excerpt, publication/retrieval dates, direction, relevance, source quality, and content hash;
- Kimi/MiniMax model IDs, aggregate scores/confidence/verdicts, concise summaries, disagreement statements, one public audit ID per model, and adversarial challenges;
- claims/evidence roots, model output hashes, request-ID hash, and passport hash;
- attestation status, network, chain ID, address, transaction/block, attestor, and explorer URL when available.

Canonical JSON recursively sorts object keys while preserving array order. Claims and evidence use deterministic Keccak-256 Merkle trees; leaves are sorted, odd leaves are duplicated, and an empty tree is `keccak256(empty bytes)`. The passport hash excludes mutable chain receipt fields and itself.

Public routes support sharing (`/p/[publicId]` and `/passport/[publicId]`), an iframe-safe badge (`/badge/[publicId]`), API retrieval, and a field-by-field integrity endpoint. Exact inputs can reuse a passport created within the configured window; `forceRefresh=true` creates a new version linked internally to its predecessor.

## Ethereum Sepolia Attestation

Mesh uses **Ethereum Sepolia**, chain ID **11155111**, for integrity receipts. AI inference, OCR, scoring, full claims, evidence documents, URLs, model reasoning, and uploaded images do not run in or get stored by the contract.

`MeshAttestationRegistry` stores only:

- `passportHash`, used as the mapping key;
- `inputHash`, `claimsRoot`, and `evidenceRoot`;
- Kimi and MiniMax output hashes;
- `requestIdsHash`;
- Truth Score and passport verification version;
- blockchain timestamp and attestor address.

The contract supports `setOperator(address,bool)`, `attestPassport(...)`, `exists(bytes32)`, and `getAttestation(bytes32)`. Only the owner or an authorized operator may attest, and each passport hash can be attested once. `PassportAttested` and `OperatorUpdated` events make writes observable.

| Deployment fact        | Value                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Network                | Ethereum Sepolia                                                                                                                |
| Chain ID               | `11155111`                                                                                                                      |
| Contract               | `MeshAttestationRegistry`                                                                                                       |
| Solidity               | `0.8.24`                                                                                                                        |
| Registry address       | [`0x93a41c639aB78f5aA00345da1AF9E3eacdf5bb6C`](https://sepolia.etherscan.io/address/0x93a41c639aB78f5aA00345da1AF9E3eacdf5bb6C) |
| Deployment transaction | [`0x85b89615…14efc7`](https://sepolia.etherscan.io/tx/0x85b89615af4387dec1b935c64b056ada6bdd519221400142a5db5a993514efc7)       |
| Version written        | Evidence Passport version (`uint32`)                                                                                            |

An attestation proves that compact values existed at a chain timestamp and allows later modification to be detected. It does not prove that a claim is factually correct. When blockchain writing is disabled, the passport is returned with `DISABLED`; if a write fails, the completed off-chain passport remains available with `FAILED` and can be retried.

## Telegram Bot

The live bot is [@mesh_passport_bot](https://t.me/mesh_passport_bot). It is a thin client: it downloads/validates Telegram inputs, calls the Mesh API, and replies with verdict, Truth Score, confidence, public ID, and a passport link.

Implemented commands are:

- `/start` — introduction;
- `/help` — accepted inputs and command guide;
- `/verify` — quick verification instructions.

Users can send a plain-text claim, a URL, a Telegram photo, or a PNG/JPEG/WebP image document up to 5 MiB. There is no `/history` command. The bot enforces one in-flight request per chat, a configurable cooldown, and an optional chat allowlist.

Local mode uses long polling. Deployed mode can use a webhook-backed Node HTTP service; it validates Telegram's secret header when configured, acknowledges the webhook immediately, and completes the long Mesh request asynchronously.

## Technical Architecture and Stack

### Web (`apps/web`)

- Next.js 16.2.10 App Router, React 18.3.1, and TypeScript 5.5
- Tailwind CSS 4 and shadcn-style components
- TanStack Query for server state; Axios plus Fetch/NDJSON for API calls
- React Hook Form and Zod for input validation
- Framer Motion, GSAP, and Lenis for motion/scroll behavior
- Sonner and Lucide React for feedback/icons
- Routes: `/`, `/verify`, `/p/[id]`, `/passport/[id]`, `/explore`, `/history`, `/badge/[id]`, and `/about`
- The client streams real backend stages and navigates successful verifications to `/passport/[publicId]`
- Attestation links come from the backend passport; the frontend holds no signer or RPC secret

### API (`apps/api`)

- NestJS 10, TypeScript, Swagger/OpenAPI, class-validator, Helmet, and throttling
- PostgreSQL with TypeORM entities and migrations; synchronization only under `NODE_ENV=test`
- `@anthropic-ai/sdk` pointed to Gonka Router
- `@tavily/core` for public URL extraction and live evidence search only
- Tesseract.js 7 for English server-side OCR
- Local filesystem or Cloudinary image storage
- Ethers 6 for registry writes/readback
- Synchronous orchestration plus an NDJSON progress endpoint; no queue or background-worker system

### Contract (`apps/contracts`)

- Solidity 0.8.24, Hardhat 2, Ethers 6, OpenZeppelin `Ownable`, Chai
- Ethereum Sepolia network configuration and local Hardhat support
- Deployment/operator scripts and a tracked 11155111 deployment record
- Build-time ABI export to `apps/api/src/modules/blockchain/abi/MeshAttestationRegistry.json`

### Telegram (`apps/telegram-bot`)

- TypeScript, Node HTTP, and grammY
- Polling and webhook modes
- Direct REST client for text, URL, and multipart image verification

No shared source package is currently present. Root Turbo tasks coordinate the four apps, while each app owns its types/configuration. There is no checked-in hosting-provider manifest, CI workflow, Redis dependency, or container configuration.

External services have strict boundaries: Tavily extracts public pages and searches for evidence, Gonka Router performs LLM inference, Cloudinary optionally stores images, PostgreSQL persists passports, and Ethereum Sepolia anchors compact integrity values.

## Repository Structure

```text
mesh/
├── apps/
│   ├── web/
│   │   └── src/{app,components,hooks,lib}/
│   ├── api/
│   │   ├── src/{common,config,database,entities,modules}/
│   │   ├── test/
│   │   └── uploads/
│   ├── contracts/
│   │   ├── contracts/
│   │   ├── deployments/
│   │   ├── scripts/
│   │   └── test/
│   └── telegram-bot/
│       └── src/
├── docs/
│   └── MESH_PRD.md
├── AGENTS.md
├── CLAUDE.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
└── README.md
```

## Prerequisites and Environment

- Node.js 20 or newer (enforced by the root `engines` field)
- pnpm 9.1.0 through Corepack (the committed package-manager version)
- PostgreSQL reachable by the API
- Gonka Router API key and Tavily API key for real verification
- A dedicated funded Ethereum-Sepolia-only wallet when attestation/deployment is enabled
- Telegram bot token to run the bot
- Cloudinary credentials only when `STORAGE_DRIVER=cloudinary`

There is no committed Docker Compose file. Install/run PostgreSQL locally or use a managed PostgreSQL URL.

Copy the application-specific examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/contracts/.env.example apps/contracts/.env
cp apps/telegram-bot/.env.example apps/telegram-bot/.env
```

The root `.env.example` is only a directory map; runtime values belong in the relevant app file.

> Never commit populated `.env` files, API keys, bot tokens, wallet private keys, mnemonics, database credentials, or cloud-storage secrets.

### API environment

| Variable                        | Required          | Secret  | Purpose                                                      | Example/default                              |
| ------------------------------- | ----------------- | ------- | ------------------------------------------------------------ | -------------------------------------------- |
| `NODE_ENV`                      | No                | No      | Runtime mode; synchronization is test-only                   | `development`                                |
| `PORT`                          | No                | No      | API port                                                     | `4000`                                       |
| `API_PREFIX`                    | No                | No      | REST prefix                                                  | `api/v1`                                     |
| `WEB_ORIGINS`                   | No                | No      | Comma-separated CORS origins                                 | `http://localhost:3000`                      |
| `DATABASE_URL`                  | Yes               | Yes     | PostgreSQL connection                                        | `postgresql://mesh:mesh@localhost:5432/mesh` |
| `GONKA_BASE_URL`                | No                | No      | Official Router base                                         | `https://api.gonkarouter.io`                 |
| `GONKA_API_KEY`                 | Yes outside tests | Yes     | Key from the [Gonka dashboard](https://gonkarouter.io/)      | empty                                        |
| `GONKA_KIMI_MODEL`              | No/fixed          | No      | Exact Kimi ID                                                | `moonshotai/Kimi-K2.6`                       |
| `GONKA_KIMI_FALLBACK_MODEL`     | No/fixed          | No      | Fallback when Gonka rejects Kimi for the current channel     | `MiniMaxAI/MiniMax-M2.7`                     |
| `GONKA_MINIMAX_MODEL`           | No/fixed          | No      | Exact MiniMax ID                                             | `MiniMaxAI/MiniMax-M2.7`                     |
| `GONKA_MAX_TOKENS`              | No                | No      | Global fallback budget                                       | `4096`                                       |
| `GONKA_VISUAL_MAX_TOKENS`       | No                | No      | OCR normalization budget                                     | `1536`                                       |
| `GONKA_CLAIM_MAX_TOKENS`        | No                | No      | Claim extraction budget                                      | `1536`                                       |
| `GONKA_INVESTIGATOR_MAX_TOKENS` | No                | No      | Each investigator budget                                     | `3072`                                       |
| `GONKA_ADVERSARIAL_MAX_TOKENS`  | No                | No      | Challenge budget                                             | `2048`                                       |
| `GONKA_NARRATIVE_MAX_TOKENS`    | No                | No      | Narrative budget                                             | `1536`                                       |
| `GONKA_TIMEOUT_MS`              | No                | No      | Per-call timeout                                             | `120000`                                     |
| `GONKA_MAX_RETRIES`             | No                | No      | Transient retries                                            | `1`                                          |
| `GONKA_RETRY_BASE_MS`           | No                | No      | Exponential-backoff base                                     | `2000`                                       |
| `TAVILY_API_KEY`                | Yes outside tests | Yes     | Key from [Tavily](https://app.tavily.com/)                   | empty                                        |
| `TAVILY_SEARCH_DEPTH`           | No                | No      | Search depth                                                 | `fast`                                       |
| `TAVILY_EXTRACT_DEPTH`          | No                | No      | URL extraction depth                                         | `basic`                                      |
| `TAVILY_MAX_RESULTS_PER_CLAIM`  | No                | No      | Deduplicated evidence cap (1–5)                              | `4`                                          |
| `TAVILY_MAX_QUERIES_PER_CLAIM`  | No                | No      | Query cap per claim                                          | `2`                                          |
| `TAVILY_SEARCH_CONCURRENCY`     | No                | No      | Concurrent searches                                          | `4`                                          |
| `STORAGE_DRIVER`                | No                | No      | `local` or `cloudinary`                                      | `local`                                      |
| `UPLOAD_DIR`                    | No                | No      | Local upload directory                                       | `./uploads`                                  |
| `MAX_IMAGE_BYTES`               | No                | No      | Configured image ceiling; controller is also capped at 5 MiB | `5242880`                                    |
| `CLOUDINARY_CLOUD_NAME`         | Cloudinary only   | No      | Cloud name from Cloudinary console                           | empty                                        |
| `CLOUDINARY_API_KEY`            | Cloudinary only   | Yes     | Cloudinary API key                                           | empty                                        |
| `CLOUDINARY_API_SECRET`         | Cloudinary only   | Yes     | Cloudinary API secret                                        | empty                                        |
| `ATTESTATION_ENABLED`           | No                | No      | Enable Sepolia writes                                        | `false`                                      |
| `ATTESTATION_NETWORK`           | No/fixed          | No      | Network label                                                | `ethereum-sepolia`                           |
| `ATTESTATION_CHAIN_ID`          | No/fixed          | No      | Wrong-network safety check                                   | `11155111`                                   |
| `ATTESTATION_RPC_URL`           | When enabled      | Usually | Sepolia JSON-RPC; provider credentials may be embedded       | `https://rpc.sepolia.org`                    |
| `ATTESTATION_EXPLORER_URL`      | No                | No      | Receipt-link base                                            | `https://sepolia.etherscan.io`               |
| `MESH_CONTRACT_ADDRESS`         | When enabled      | No      | Deployed registry                                            | `0x93a41c…bb6C`                              |
| `ATTESTOR_PRIVATE_KEY`          | When enabled      | Yes     | Authorized dedicated testnet signer                          | empty                                        |
| `ATTESTATION_CONFIRMATIONS`     | No                | No      | Blocks before readback                                       | `1`                                          |
| `PASSPORT_REUSE_WINDOW_MINUTES` | No                | No      | Exact-input cache window                                     | `60`                                         |
| `RATE_LIMIT_TTL_MS`             | No                | No      | Process-local throttle window                                | `60000`                                      |
| `RATE_LIMIT_MAX`                | No                | No      | Default request limit                                        | `20`                                         |
| `SWAGGER_ENABLED`               | No                | No      | Serve `/docs`                                                | `true`                                       |

OCR has no environment variable: the current implementation always requests `eng`.

### Web environment

| Variable              | Required   | Secret | Purpose                                             | Example                 |
| --------------------- | ---------- | ------ | --------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Yes        | No     | Public backend origin; the client appends `/api/v1` | `http://localhost:4000` |
| `NEXT_PUBLIC_APP_URL` | Production | No     | Canonical/social-sharing frontend origin            | `http://localhost:3000` |

`NEXT_PUBLIC_API_BASE_URL` is also accepted by the API client as a higher-priority compatibility alias, but the checked-in example uses `NEXT_PUBLIC_API_URL`. Never expose Gonka, Tavily, database, bot, storage-secret, RPC-signer, or wallet-private-key values through `NEXT_PUBLIC_*`.

### Contract environment

| Variable                   | Required                      | Secret  | Purpose                                                       |
| -------------------------- | ----------------------------- | ------- | ------------------------------------------------------------- |
| `ETHEREUM_SEPOLIA_RPC_URL` | For deployment                | Usually | Sepolia JSON-RPC; public default is available                 |
| `DEPLOYER_PRIVATE_KEY`     | For deployment/operator calls | Yes     | Dedicated funded testnet signer                               |
| `INITIAL_OWNER_ADDRESS`    | No                            | No      | Owner; deployer is default                                    |
| `INITIAL_OPERATOR_ADDRESS` | No                            | No      | Operator set during deployment when deployer can authorize it |
| `ETHERSCAN_API_KEY`        | Verification only             | Yes     | Source-verification key from Etherscan                        |
| `MESH_CONTRACT_ADDRESS`    | Operator script               | No      | Existing registry address                                     |
| `OPERATOR_ADDRESS`         | Operator script               | No      | Address to authorize/revoke                                   |
| `OPERATOR_ALLOWED`         | No                            | No      | `true` to authorize; `false` to revoke                        |

### Telegram environment

| Variable                      | Required                | Secret    | Purpose                                | Default                 |
| ----------------------------- | ----------------------- | --------- | -------------------------------------- | ----------------------- |
| `TELEGRAM_BOT_TOKEN`          | Yes                     | Yes       | Token created with BotFather           | none                    |
| `MESH_API_BASE_URL`           | No                      | No        | Backend origin                         | `http://localhost:4000` |
| `MESH_WEB_BASE_URL`           | No                      | No        | Public passport origin                 | `http://localhost:3000` |
| `MESH_API_PREFIX`             | No                      | No        | API prefix                             | `api/v1`                |
| `TELEGRAM_ALLOWED_CHAT_IDS`   | No                      | Sensitive | Optional comma-separated allowlist     | open demo mode          |
| `TELEGRAM_RATE_LIMIT_SECONDS` | No                      | No        | Per-chat cooldown; minimum 15          | `90`                    |
| `MESH_REQUEST_TIMEOUT_MS`     | No                      | No        | API call timeout; minimum 30 seconds   | `180000`                |
| `TELEGRAM_MODE`               | No                      | No        | `polling` or `webhook`                 | inferred                |
| `PORT`                        | Webhook mode            | No        | Bot HTTP port                          | `8080`                  |
| `TELEGRAM_WEBHOOK_URL`        | Webhook mode            | No        | Public HTTPS origin                    | none                    |
| `RENDER_EXTERNAL_URL`         | No                      | No        | Auto-detected webhook origin on Render | none                    |
| `TELEGRAM_WEBHOOK_PATH`       | No                      | No        | Webhook path                           | `/telegram/webhook`     |
| `TELEGRAM_WEBHOOK_SECRET`     | Recommended for webhook | Yes       | Telegram secret-token header           | none                    |

The code also accepts `WEBHOOK_URL` as a legacy fallback for the webhook origin.

## Local Development

### 1. Install

```bash
git clone https://github.com/benjaminnkem/AI3-hack.git mesh
cd mesh
corepack enable
pnpm install --frozen-lockfile
```

### 2. Create PostgreSQL and environments

Create a PostgreSQL database named `mesh` with credentials matching your `DATABASE_URL`, then:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @mesh/api migration:run
```

Fill `GONKA_API_KEY` and `TAVILY_API_KEY` in `apps/api/.env`. Keep `ATTESTATION_ENABLED=false` until the signer and deployed contract are configured.

There is no seed command. `migration:revert` exists but is destructive; use it only after reviewing the migration being reverted.

### 3. Run API and web

```bash
# terminal 1
pnpm --filter @mesh/api dev

# terminal 2
pnpm --filter @mesh/web dev
```

Open [localhost:3000](http://localhost:3000), [API health](http://localhost:4000/api/v1/health), and [local Swagger](http://localhost:4000/docs).

After all four app environments are configured, `pnpm dev` starts every workspace development task. Running app-specific commands is easier while the Telegram token or contract environment is not ready.

### 4. Real-service smoke calls

```bash
curl https://api.gonkarouter.io/v1/messages \
  -H "x-api-key: $GONKA_API_KEY" \
  -H 'anthropic-version: 2023-06-01' \
  -H 'content-type: application/json' \
  -d '{"model":"moonshotai/Kimi-K2.6","max_tokens":1024,"messages":[{"role":"user","content":"Reply with just: pong"}]}'

curl https://api.gonkarouter.io/v1/messages \
  -H "x-api-key: $GONKA_API_KEY" \
  -H 'anthropic-version: 2023-06-01' \
  -H 'content-type: application/json' \
  -d '{"model":"MiniMaxAI/MiniMax-M2.7","max_tokens":1024,"messages":[{"role":"user","content":"Reply with just: pong"}]}'

curl https://api.tavily.com/search \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -H 'content-type: application/json' \
  -d '{"query":"Ethereum Sepolia chain id","search_depth":"fast","max_results":2,"include_answer":false}'
```

### 5. Verification smoke calls

```bash
curl -X POST http://localhost:4000/api/v1/verifications \
  -H 'content-type: application/json' \
  -d '{"inputType":"TEXT","content":"The Earth is approximately 4.5 billion years old."}'

curl -N -X POST http://localhost:4000/api/v1/verifications/stream \
  -H 'content-type: application/json' \
  -d '{"inputType":"URL","url":"https://www.reuters.com/"}'

curl -X POST http://localhost:4000/api/v1/verifications \
  -F inputType=IMAGE \
  -F file=@./screenshot.png
```

## Smart Contract Setup

### Compile and test

```bash
pnpm --filter @mesh/contracts build
pnpm --filter @mesh/contracts test
pnpm --filter @mesh/contracts typecheck
```

The build exports the ABI to `apps/api/src/modules/blockchain/abi/MeshAttestationRegistry.json`.

### Local chain and deployment

```bash
# terminal 1
pnpm --filter @mesh/contracts exec hardhat node

# terminal 2
pnpm --filter @mesh/contracts deploy:local
```

Deployment records are written to `apps/contracts/deployments/<chainId>.json`.

### Ethereum Sepolia deployment

1. Create a dedicated testnet-only wallet.
2. Fund it with Sepolia ETH from a faucet listed by [ethereum.org](https://ethereum.org/developers/docs/networks/#sepolia).
3. Configure `apps/contracts/.env`.
4. Run:

```bash
pnpm --filter @mesh/contracts deploy:sepolia
```

To authorize a separate backend signer:

```bash
MESH_CONTRACT_ADDRESS=0x... OPERATOR_ADDRESS=0x... \
  pnpm --filter @mesh/contracts operator:sepolia
```

Optional source verification:

```bash
pnpm --filter @mesh/contracts verify:sepolia -- 0xCONTRACT 0xINITIAL_OWNER
```

Copy the deployed address to API `MESH_CONTRACT_ADDRESS`, configure the authorized `ATTESTOR_PRIVATE_KEY`, set `ATTESTATION_ENABLED=true`, and confirm `/api/v1/health` reports RPC reachability and contract bytecode. The frontend needs no contract variable because it receives public receipt data from the API.

## Telegram Setup

1. Open BotFather, create a bot, and copy the token to `apps/telegram-bot/.env` as `TELEGRAM_BOT_TOKEN`.
2. Set the public/local Mesh API and web origins.
3. For development, leave `TELEGRAM_MODE=polling` or unset with no webhook URL.
4. Start the bot and test `/start`, `/help`, `/verify`, a claim, a URL, and an image:

```bash
pnpm --filter @mesh/telegram-bot dev
```

For webhook deployment, set `TELEGRAM_MODE=webhook`, a public HTTPS `TELEGRAM_WEBHOOK_URL`, the path, and a strong secret, then run:

```bash
pnpm --filter @mesh/telegram-bot build
pnpm --filter @mesh/telegram-bot start
```

The process registers the webhook automatically. Do not run long polling with the same bot token while the webhook deployment is live; Telegram will return a 409 conflict. No command-registration script is included, so optional BotFather menu descriptions are a manual action.

## API

Production Swagger is at [ai3-hack-be.oluwadunsin.dev/docs](https://ai3-hack-be.oluwadunsin.dev/docs). The default API prefix is `/api/v1`.

| Method | Route                            | Purpose                                                 |
| ------ | -------------------------------- | ------------------------------------------------------- |
| `POST` | `/verifications`                 | Synchronous JSON/multipart verification                 |
| `POST` | `/verifications/stream`          | Synchronous NDJSON progress plus result                 |
| `GET`  | `/verifications/:uuid`           | Status, stage, failure, and passport                    |
| `GET`  | `/passports`                     | Cursor list filtered by verdict/input type              |
| `GET`  | `/passports/:publicId`           | Public Evidence Passport                                |
| `GET`  | `/passports/:publicId/integrity` | Recompute and compare stored/on-chain values            |
| `POST` | `/passports/:publicId/attest`    | Idempotent retry unless attestation is disabled         |
| `GET`  | `/passports/:publicId/badge`     | Compact badge JSON                                      |
| `GET`  | `/health`                        | API, database, integration config, RPC, and code checks |

Normal controller responses use `{ "success": true, "message": "...", "data": ... }`; failures include a machine-readable code and trace ID. The NDJSON endpoint emits unwrapped `progress`, `result`, or `error` lines by design.

## Testing

### Workspace

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### API

```bash
pnpm --filter @mesh/api lint
pnpm --filter @mesh/api typecheck
pnpm --filter @mesh/api test:unit
pnpm --filter @mesh/api test:e2e
pnpm --filter @mesh/api build
```

Unit specs cover bounded concurrency, scoring/verdicts, Tavily normalization, URL/SSRF rules, Gonka text/structured parsing and repair, integrity hashing/Merkle behavior, and investigation schemas. The API E2E suite uses deterministic controller-level fakes for text/URL/image contracts, NDJSON stages, no-claims, external failure, failed attestation, mismatch, reuse, and refresh. It does not exercise live PostgreSQL, OCR, Gonka, Tavily, or Sepolia.

### Contract

```bash
pnpm --filter @mesh/contracts build
pnpm --filter @mesh/contracts typecheck
pnpm --filter @mesh/contracts test
```

Contract tests cover ownership, operator authorization/revocation, event/readback values, duplicate attestations, unauthorized calls, score bounds, zero values, and missing attestations.

### Web and Telegram

```bash
pnpm --filter @mesh/web lint
pnpm --filter @mesh/web build
pnpm --filter @mesh/telegram-bot lint
pnpm --filter @mesh/telegram-bot typecheck
pnpm --filter @mesh/telegram-bot build
```

No web unit/component/Playwright suite or Telegram automated test suite is currently configured.

### Manual end-to-end smoke test

1. Start PostgreSQL and run API migrations.
2. Start the API and web app.
3. Submit text and confirm Tavily evidence plus Kimi/MiniMax responses.
4. Confirm Gonka audit IDs, disagreement, Truth Score, and passport persistence.
5. Enable attestation and confirm a Sepolia transaction and Etherscan receipt.
6. Run the integrity endpoint and verify stored and on-chain matches.
7. Open the public passport and badge routes.
8. Upload a clear English screenshot and confirm OCR enters the same pipeline.
9. Start the Telegram bot and verify text, URL, and image inputs.

## Judge Demo Flow

1. Open the [live application](https://ai3-hack.oluwadunsin.dev) and select **Verify a claim**.
2. Submit an accessible public article URL.
3. Explain that Mesh permits only HTTP(S), resolves DNS, and blocks private or unsafe network targets before retrieval.
4. Show that Tavily Extract reads the article content and that atomic claims are generated from the normalized page text—not the title alone.
5. Show Tavily Search retrieving independent candidate evidence for those claims, including the contradiction-oriented query when it falls within the configured query cap.
6. Open the claims and supporting/opposing/neutral evidence, including source titles, domains, excerpts, dates, relevance, and model-derived quality.
7. Compare Kimi and MiniMax and highlight any visible disagreement.
8. Explain the deterministic Truth Score and its evidence/coverage/adversarial inputs.
9. Open the public passport, Gonka audit IDs, hashes, and integrity panel.
10. Open the Ethereum Sepolia receipt and run the integrity check.
11. Upload a screenshot containing a short English claim; explain that Tesseract.js extracts its text and that the current UI shows the result as the passport input preview rather than a separate editable OCR step.
12. Send a claim or image to [@mesh_passport_bot](https://t.me/mesh_passport_bot) and open the returned passport.

Because evidence and external services are live, demo results and timing can change. Warm hosted services before judging and keep a text example available if a social platform blocks URL extraction.

## Deployment

| Service          | Live URL                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| Mesh web         | [ai3-hack.oluwadunsin.dev](https://ai3-hack.oluwadunsin.dev)                 |
| Telegram bot     | [t.me/mesh_passport_bot](https://t.me/mesh_passport_bot)                     |
| Backend API docs | [ai3-hack-be.oluwadunsin.dev/docs](https://ai3-hack-be.oluwadunsin.dev/docs) |

The repository does not include Vercel, Railway, Render, or other provider manifests, so it does not establish which providers host the live web/API. Deploy to any Node/PostgreSQL-capable platform with these real commands:

```bash
# web
pnpm --filter @mesh/web build
pnpm --filter @mesh/web start

# API
pnpm --filter @mesh/api migration:run
pnpm --filter @mesh/api build
NODE_ENV=production pnpm --filter @mesh/api start

# Telegram
pnpm --filter @mesh/telegram-bot build
pnpm --filter @mesh/telegram-bot start

# contract (when redeploying)
pnpm --filter @mesh/contracts deploy:sepolia
```

Deployment checklist:

- provision PostgreSQL, run migrations, and keep credentials in the platform secret manager;
- configure Gonka/Tavily and optional Cloudinary secrets server-side;
- set `WEB_ORIGINS` to the exact deployed web origin;
- set web `NEXT_PUBLIC_API_URL` to the backend origin;
- use request/proxy timeouts longer than the configured Gonka call budget;
- ensure the Node runtime can run Tesseract workers and resolve English language data;
- configure the 11155111 registry address, funded authorized signer, RPC, and confirmations;
- run `/api/v1/health` and a real verification;
- configure the Telegram webhook origin/secret and verify `/health` on the bot service;
- retain local uploads on persistent storage or use Cloudinary;
- warm services and verify production links before the demo.

## Security, Privacy, and Trust

Implemented protections include:

- server-only Gonka/Tavily/Cloudinary secrets, database credentials, bot token, and signer private key;
- validated environment configuration that fails outside tests without Gonka/Tavily keys;
- Helmet headers, strict DTO whitelisting, configured CORS, global/process-local throttling, and a stricter verification-route limit;
- URL scheme, DNS, private-network, loopback, and metadata-target checks before Tavily retrieval;
- MIME validation and a 5 MiB in-memory upload limit;
- text rendering in React rather than arbitrary extracted HTML;
- Zod validation plus a single bounded repair call for AI JSON;
- concise reasoning summaries rather than requested/stored chain-of-thought;
- compact on-chain values only—no original content, evidence excerpts, URLs, reasoning, or images;
- canonical hashing, Merkle roots, contract readback, and field-by-field integrity checks;
- webhook secret-header validation when configured and optional Telegram chat allowlisting.

Trust boundaries matter. Tavily evidence can contain prompt-injection text, sources can be wrong or stale, and models can still make mistakes. The current prompts tell models to use supplied evidence, but no comprehensive retrieved-content prompt-injection classifier exists. Local uploads have no automatic expiry, and Cloudinary retention depends on account policy.

Use a dedicated Ethereum-Sepolia-only wallet that never holds mainnet assets. Never log or commit real keys. Treat public passport input previews as public data.

## Limitations

- AI assessments can be wrong, overconfident, or sensitive to incomplete evidence.
- A high score is not absolute proof or professional medical, legal, financial, or electoral advice.
- Tavily Extract may not read pages behind authentication, paywalls, anti-bot systems, or unsupported client-side rendering; social platforms commonly block extraction.
- Successful extraction means readable content was returned, not that the page is accurate, complete, or current.
- Tavily Search coverage depends on indexed and accessible sources. Results can be incomplete, duplicated, outdated, or misleading even after Mesh deduplicates retained evidence.
- Tavily retrieval is evidence input, not an authority on truth; pages and publication context can change after verification.
- OCR is English-only and may misread blurred, low-resolution, handwritten, rotated, or stylized text.
- No image preprocessing, persisted OCR confidence, user OCR confirmation, image forensics, or deepfake detector is implemented.
- Native image content is not currently sent through Gonka; Kimi receives the Tesseract transcript.
- Tesseract errors become an empty transcript, so poor images may end as no-claims or fail in a later stage.
- The browser currently displays a 20,000-character text counter while the backend enforces 10,000 characters; 10,000 is the effective limit.
- Attestation may be disabled or fail while an off-chain passport still succeeds.
- Ethereum Sepolia proves integrity and timing, not factual correctness, and testnet availability is not guaranteed.
- Gonka IDs for every stage are persisted and hashed, but the public model comparison exposes only one audit ID per model rather than a stage-by-stage audit list.
- Reuse is based on an exact input hash, not semantic equivalence.
- API E2E tests use fakes; there are no automated browser, OCR, Telegram, live-provider, or live-chain tests.
- No hosting manifests, upload cleanup policy, CI workflow, or open-source license are committed.

## Roadmap

- Editable OCR confirmation, preprocessing, rotation handling, and multilingual OCR
- Native multimodal Gonka analysis when the deployed Router path supports the required image blocks
- Browser extension and richer embeddable verification widgets
- TypeScript SDK and public MCP server
- Semantic claim clustering and cross-post passport reuse
- Evidence update alerts and a visible passport version timeline
- Specialized image/deepfake forensic integrations
- Stronger retrieved-content prompt-injection defenses and source reputation signals
- Automated web, OCR, Telegram, live-provider, and Sepolia smoke suites

## Contributing and License

For contributions:

1. Read the authoritative [Mesh PRD](docs/MESH_PRD.md) and `AGENTS.md`.
2. Keep changes inside the relevant app boundary and preserve the pnpm/Turborepo conventions.
3. Route all LLM inference through Gonka Router and use Tavily only for retrieval.
4. Add tests for behavioral changes and run the relevant lint, typecheck, tests, and production build.
5. Never commit populated environment files, generated secrets, or real user uploads.

No license file is currently committed. The repository is provided for AI³ Growth Hackathon evaluation; reuse rights are not granted by an open-source license until the maintainers choose and add one.

## Acknowledgements

Mesh is built with support from the AI³ Growth Hackathon and Gonka. It uses Gonka Router, Kimi-K2.6, MiniMax-M2.7, Tesseract.js, Tavily for public URL extraction and live evidence retrieval, Ethereum Sepolia, Telegram/grammY, Next.js, NestJS, PostgreSQL, TypeORM, Hardhat, OpenZeppelin, and the wider TypeScript open-source ecosystem.
