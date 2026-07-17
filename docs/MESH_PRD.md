# Mesh Product Requirements Document

**Version:** 1.0  
**Status:** Hackathon MVP specification  
**Last updated:** 14 July 2026  
**Product:** Mesh  
**Tagline:** Every digital claim deserves a verifiable Evidence Passport.

---

## 1. Executive Summary

Mesh is a decentralized evidence-verification protocol and web application. A user submits a text claim, URL, social post URL, screenshot, or image. For image inputs, the implemented MVP extracts English text with Tesseract.js and sends that transcript—not a native image block—through the same claim pipeline. Mesh breaks the input into atomic factual claims, gathers current web evidence, asks two independent AI models through Gonka Router to assess the claims, preserves model disagreement, calculates a transparent 0–100 Truth Score, creates a portable Evidence Passport, hashes its important components, and anchors the resulting passport on Ethereum Sepolia.

The product is not presented as an infallible “truth oracle.” It is decision-support infrastructure that makes an investigation reusable, transparent, tamper-evident, and independently auditable.

The hackathon MVP must demonstrate one complete flow:

1. Submit text, URL, or image.
2. Extract independently verifiable claims.
3. Retrieve supporting and opposing evidence from the live web.
4. Run Kimi-K2.6 and MiniMax-M2.7 through Gonka Router.
5. Show agreement, disagreement, source quality, and adversarial challenges.
6. Produce a deterministic Truth Score and verdict.
7. Generate a canonical Evidence Passport and cryptographic integrity values.
8. Publish a compact attestation to a smart contract on Ethereum Sepolia.
9. Display a public passport page, Gonka response IDs, and the blockchain receipt.
10. Allow anyone to re-check the off-chain passport against its on-chain hash.

---

## 2. Problem

Fact-checks are usually isolated inside one website or platform. When the same claim reappears on X, Telegram, WhatsApp, Discord, a blog, or a news site, people often repeat the same investigation from scratch. Existing verification results may also be edited, removed, or presented without enough information about the evidence and reasoning used.

Users need a portable verification artifact that answers:

- What exact factual claims were found?
- What evidence supports or opposes each claim?
- How reliable and recent are the sources?
- Did independent models agree?
- What important disagreement or uncertainty remains?
- Has the published result changed since it was issued?
- Can another person or application verify the receipt without trusting Mesh’s database?

---

## 3. Solution

Mesh converts a digital input into an **Evidence Passport**.

An Evidence Passport contains:

- A public passport identifier and version.
- The normalized input and its hash.
- Atomic factual claims.
- Supporting, opposing, and neutral evidence.
- Source URLs, source dates, short excerpts, relevance, and quality assessments.
- Kimi and MiniMax’s independent analyses.
- Model confidence, agreement, and disagreement.
- Adversarial challenges that attempt to disprove the leading conclusion.
- A deterministic Truth Score from 0 to 100.
- One of four verdicts: `SUPPORTED`, `UNVERIFIED`, `MISLEADING`, or `CONTRADICTED`.
- Gonka response/request identifiers for auditability.
- Claim, evidence, model-output, request-ID, and passport hashes.
- An Ethereum Sepolia transaction hash and contract verification result.

The passport is accessible at a stable public URL and can be represented as an embeddable badge.

---

## 4. Product Positioning

Mesh should be described as:

> A decentralized evidence protocol that turns digital claims into portable, multi-model, tamper-evident Evidence Passports.

Mesh should not be described as:

- A perfect truth oracle.
- A legal, medical, financial, or electoral authority.
- A replacement for human experts.
- A detector that guarantees an image is or is not AI-generated.
- A blockchain that stores private or harmful user content permanently.

---

## 5. Goals

### 5.1 MVP goals

- Deliver a polished, runnable demonstration for text, URL, and image verification.
- Use Gonka Router for every LLM inference call.
- Use at least two different Gonka-hosted models: Kimi-K2.6 and MiniMax-M2.7.
- Use live web retrieval to gather current evidence.
- Preserve and display model disagreement instead of hiding it.
- Produce a consistent 0–100 Truth Score with an explainable deterministic formula.
- Store only compact hashes and metadata on-chain.
- Generate a public Evidence Passport page and an embeddable badge.
- Make the entire repository easy to configure, run, test, and deploy.

### 5.2 Success criteria

A judge can:

1. Paste a viral claim or URL.
2. See atomic claims and live evidence.
3. See Kimi and MiniMax independently disagree or agree.
4. See the final score and exactly how it was derived.
5. See Gonka response IDs.
6. Create an on-chain attestation.
7. open the Ethereum Sepolia explorer transaction.
8. Run an integrity verification and receive a valid result.
9. share a public Evidence Passport URL or badge.

---

## 6. Non-Goals for the Hackathon MVP

The following are intentionally out of scope:

- User accounts, authentication, subscriptions, or payment plans.
- Community voting, token incentives, staking, or governance.
- A browser extension, WhatsApp bot, or native mobile app. The repository includes a thin Telegram client that calls the same REST API rather than reimplementing verification.
- A full TypeScript SDK or public MCP server. The REST API and badge are the MVP integration surfaces.
- Permanently storing complete claims, screenshots, or evidence on-chain.
- Training or fine-tuning models.
- Building a general-purpose web crawler.
- Automatically issuing real-world sanctions or decisions based on a score.
- Supporting video or audio in the MVP.

These can be mentioned as roadmap items but must not distract from finishing the core flow.

---

## 7. Primary Users

### 7.1 Ordinary internet user

A person receives a suspicious post, screenshot, or article and wants a clear, evidence-backed assessment.

### 7.2 Journalist or researcher

A user wants an auditable summary of claims, evidence, contradictions, dates, and model disagreement.

### 7.3 Application developer or AI agent

A client wants to retrieve a reusable Evidence Passport through the REST API instead of repeating an entire investigation.

### 7.4 Judge or auditor

A user wants to verify that the displayed passport matches the on-chain attestation.

---

## 8. Core User Stories

- As a user, I can paste a text claim and receive an Evidence Passport.
- As a user, I can paste a URL, including a social-post URL, and Mesh extracts its readable content before verification.
- As a user, I can upload a PNG, JPEG, or WebP screenshot and Mesh extracts English text with Tesseract.js before Kimi neutrally normalizes the OCR transcript through Gonka Router.
- As a user, I can see each atomic claim separately.
- As a user, I can see supporting and opposing evidence for each claim.
- As a user, I can see publication dates, domains, excerpts, source quality, and relevance.
- As a user, I can see Kimi and MiniMax’s independent scores and explanations.
- As a user, I can see exactly where the models disagree.
- As a user, I can see adversarial challenges and unresolved uncertainty.
- As a user, I can see a 0–100 Truth Score, confidence score, and verdict.
- As a user, I can inspect Gonka response IDs.
- As a user, I can see the on-chain transaction and contract address.
- As a user, I can run an integrity check that recomputes hashes and compares them with the contract.
- As a user, I can copy a public link or embeddable badge.
- As a user, I can request a fresh version when evidence may have changed.

---

## 9. Technical Constraints and Confirmed External Interfaces

### 9.1 Repository

A Turborepo already exists with these applications:

- `apps/web`
- `apps/api`
- `apps/contracts`
- `apps/telegram-bot`

Agents must inspect and preserve the existing package manager, lint rules, TypeScript configuration, and framework conventions. They must not rebuild or replace the monorepo unnecessarily.

### 9.2 Expected application stack

Use existing configured tools where present. When an app is empty or incomplete, use:

- Web: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Framer Motion.
- Backend: NestJS, TypeScript, PostgreSQL, TypeORM migrations, Swagger/OpenAPI, class-validator, structured logging.
- Contract: Solidity and the existing Hardhat or Foundry setup. If no contract toolchain exists, use Hardhat 3 with TypeScript and the official Ethers or Viem toolbox.
- EVM network: Ethereum Sepolia, chain ID `11155111`.
- Live evidence retrieval: Tavily JavaScript SDK, `@tavily/core`.
- Image persistence: storage adapter with Cloudinary in deployed environments and local/temp storage in development and tests.

Do not add Redis, Kafka, RabbitMQ, Kubernetes, microservices, or a separate vector database.

### 9.3 Gonka Router

All AI inference must pass through Gonka Router.

Confirmed configuration:

- Base URL: `https://api.gonkarouter.io`
- Anthropic-compatible endpoint: `POST /v1/messages`
- Authentication: `x-api-key` or `Authorization: Bearer`
- Required Anthropic version for raw requests: `2023-06-01`
- Recommended TypeScript SDK: `@anthropic-ai/sdk`
- Kimi model ID: `moonshotai/Kimi-K2.6`
- MiniMax model ID: `MiniMaxAI/MiniMax-M2.7`
- Use `max_tokens` of at least `1024`; default the application to `4096`.
- The response body includes an `id` such as `msg_...` and text content blocks. Store the body `id` as the Gonka audit ID. If the SDK also exposes a request-header ID, store both without assuming it always exists.

Kimi is listed by Gonka as supporting vision, function calling, reasoning, and search. MiniMax is listed as supporting chat, function calling, and reasoning. Do not rely on undocumented automatic-search behavior. Tavily is the explicit live-web retrieval layer; Gonka models analyze the retrieved evidence.

### 9.4 Web3 network

Use Ethereum Sepolia for the hackathon attestation because it is EVM-compatible and widely supported by wallets, faucets, and explorers.

- RPC default: `https://rpc.sepolia.org`
- Chain ID: `11155111`
- Explorer base: `https://sepolia.etherscan.io`

The public RPC is suitable for testing but should be replaceable by an Alchemy, QuickNode, or other provider URL through environment variables.

---

## 10. End-to-End Verification Flow

### Stage 1: Accept and normalize input

The user chooses one input type:

- `TEXT`: plain text up to 10,000 characters.
- `URL`: a valid HTTP or HTTPS URL.
- `IMAGE`: PNG, JPEG, or WebP, maximum 5 MB.

Normalization rules:

- Trim whitespace and normalize line endings.
- Remove tracking query parameters from URLs where safe.
- Store the original user input separately from normalized content.
- Generate `inputHash = keccak256(UTF8(canonical normalized input))`.
- Never put the original input on-chain.

For URL input:

1. Use Tavily Extract to retrieve readable page content.
2. If extraction fails, use Tavily Search with the URL, page title, or visible snippet as a fallback.
3. Store only a short normalized excerpt in public output; do not republish entire copyrighted pages.

For image input:

1. Validate MIME type and file size.
2. Store through the storage adapter.
3. Extract visible English text with Tesseract.js.
4. Send the OCR transcript and media type to Kimi through Gonka as text. The current Router integration does not send a native image content block.
5. Run a neutral normalization prompt that structures visible text, named entities, dates, numbers, logos, and a conservative scene description without assigning a verdict.
6. Feed that neutral transcript into later text stages. The current investigators do not inspect the original image.

### Stage 2: Atomic claim extraction

Use MiniMax through Gonka to convert normalized content into between 1 and 5 independently verifiable claims.

Each claim must include:

- `text`
- `normalizedText`
- `importance`: integer 1–5
- `context`
- `dateSensitive`: boolean
- `searchQueries`: 1–3 concise queries
- `claimHash`

Exclude pure opinion, satire that contains no factual assertion, commands, and unverifiable personal feelings. If no factual claim exists, complete the verification with an `UNVERIFIED` result and an explanatory message instead of inventing claims.

### Stage 3: Evidence retrieval

For every atomic claim:

1. Execute Tavily searches using the generated queries.
2. Use `searchDepth: "advanced"` where credits allow.
3. Use `topic: "news"` for strongly date-sensitive claims and `topic: "general"` otherwise.
4. Retrieve up to five high-quality results per claim.
5. Prefer primary sources, official statements, original documents, and direct reporting.
6. Deduplicate by canonical URL and domain.
7. Optionally extract the top source pages to obtain clean content.
8. Store only title, URL, domain, short excerpt, publication date, retrieval date, Tavily relevance, and content hash.

Evidence directions are finalized after model assessment:

- `SUPPORTS`
- `OPPOSES`
- `NEUTRAL`

The application must seek opposing evidence, not only confirmation.

### Stage 4: Independent model investigations

Run both calls independently and in parallel after evidence retrieval.

#### Kimi Investigator

Model: `moonshotai/Kimi-K2.6`

Input:

- Original normalized content.
- Neutral visual transcript when applicable.
- Atomic claims.
- Retrieved evidence.

Output per claim:

- `supportProbability`: 0–100
- `confidence`: 0–100
- `verdictSuggestion`
- `reasoningSummary`
- evidence assessments with direction and quality score
- missing context
- uncertainty

#### MiniMax Investigator

Model: `MiniMaxAI/MiniMax-M2.7`

Input:

- Normalized textual content or neutral image transcript.
- Atomic claims.
- The same retrieved evidence.

MiniMax must not receive Kimi’s verdict or reasoning.

Output uses the same schema as Kimi.

### Stage 5: Adversarial review

Run an adversarial reviewer through Gonka after both independent responses exist. The reviewer receives the input, claims, evidence, and both structured assessments.

Its job is to challenge the leading conclusion by identifying:

- Contradictory evidence.
- Weak or circular sources.
- Stale information.
- Mismatched dates or entities.
- Unsupported causal claims.
- Important omitted context.
- Possible image-context manipulation.
- Model reasoning conflicts.

It returns challenges with:

- `claimId`
- `challenge`
- `severity`: 0–100
- `resolved`: boolean
- `resolution`

The adversarial reviewer may not silently change model outputs.

### Stage 6: Deterministic consensus and scoring

The final numeric Truth Score must be calculated in application code, not invented solely by a final LLM.

For each claim:

1. Let `modelMean` be the average of Kimi and MiniMax `supportProbability`.
2. Let `disagreement` be the absolute difference between those probabilities.
3. For each evidence item, calculate:
   - `quality = average(Kimi quality, MiniMax quality) / 100`
   - `relevance = Tavily relevance score`, normalized to 0–1
   - `weight = quality * relevance`
   - direction value: support `+1`, oppose `-1`, neutral `0`
4. Calculate evidence balance:
   - `balance = sum(directionValue * weight) / max(sum(abs(weight)), 1)`
   - `rawEvidenceScore = 50 + 50 * balance`
5. Reduce overconfidence when fewer than three independent domains exist:
   - `coverage = min(1, distinctDomains / 3)`
   - `evidenceScore = 50 + (rawEvidenceScore - 50) * coverage`
6. Calculate unresolved adversarial penalty:
   - sum unresolved challenge severities, divide by 10, cap at 20.
7. Calculate:
   - `claimTruthScore = clamp(round(0.60 * evidenceScore + 0.40 * modelMean - adversarialPenalty), 0, 100)`
8. Calculate confidence:
   - average model confidence: 35%
   - model agreement (`100 - disagreement`): 25%
   - evidence domain coverage: 25%
   - average source quality: 15%
   - clamp to 0–100.

Overall scores:

- Weight claim truth and confidence by claim importance 1–5.
- Round to whole numbers.

Verdict bands:

- `SUPPORTED`: 70–100
- `UNVERIFIED`: 50–69
- `MISLEADING`: 25–49
- `CONTRADICTED`: 0–24

A final Gonka narrative call may summarize the deterministic result, but it must not alter computed scores, hashes, or verdict bands.

### Stage 7: Evidence Passport creation

Create a canonical passport payload. Use stable JSON serialization with recursively sorted object keys and preserved array order.

The canonical payload must exclude:

- `passportHash` itself.
- transaction hash.
- block number.
- explorer URL.
- mutable attestation status.

It may include the immutable `generatedAt` timestamp and schema version.

Generate:

- `claimsRoot`: Merkle root of claim leaves.
- `evidenceRoot`: Merkle root of evidence leaves.
- `kimiOutputHash`: hash of canonical Kimi parsed output.
- `minimaxOutputHash`: hash of canonical MiniMax parsed output.
- `requestIdsHash`: hash of the sorted Gonka audit IDs.
- `passportHash`: hash of the complete canonical passport payload.

Use Keccak-256 throughout for EVM compatibility.

### Stage 8: On-chain attestation

Call the Mesh attestation registry on Ethereum Sepolia using a dedicated testnet backend signer.

The contract stores only:

- `passportHash`
- `inputHash`
- `claimsRoot`
- `evidenceRoot`
- `kimiOutputHash`
- `minimaxOutputHash`
- `requestIdsHash`
- `truthScore`
- `verificationVersion`
- blockchain timestamp
- attestor address

It must not store:

- Original user content.
- Full claims.
- Evidence text.
- Model reasoning.
- URLs.
- Images.
- Private information.

The passport can still be returned when the chain is temporarily unavailable, but it must show `ATTESTATION_FAILED` and offer a retry endpoint. A successful hackathon demo must show a confirmed Ethereum Sepolia transaction.

### Stage 9: Public verification

A public passport page displays the complete result. An integrity endpoint must:

1. Recreate the canonical payload from stored data.
2. Recompute all roots and hashes.
3. Read the attestation from the contract.
4. Compare off-chain and on-chain values.
5. Return a field-by-field result and final `valid` boolean.

---

## 11. AI Output Reliability Requirements

Gonka models are instructed to return JSON only. Because the Anthropic-compatible API does not guarantee schema-constrained output in this specification:

- Define a Zod schema for every agent response.
- Extract JSON safely from plain text or fenced text.
- Validate with Zod.
- On validation failure, make one repair call through Gonka containing the validation errors and the invalid output.
- If the repair also fails, fail the verification stage with a clear error. Never invent a successful result.
- Store parsed structured output and optionally the raw response for debugging. Raw chain-of-thought must not be requested or exposed; store concise reasoning summaries only.
- Record model ID, Gonka body response ID, optional header request ID, token usage, duration, and retry count.

All prompts must state that models may use only the supplied evidence and must clearly distinguish absent evidence from contradictory evidence.

---

## 12. Evidence Passport Data Contract

The API should return a structure equivalent to the following. Names may follow existing project conventions, but the information must remain present.

```json
{
  "schemaVersion": "1.0.0",
  "publicId": "pm_...",
  "verificationId": "uuid",
  "version": 1,
  "generatedAt": "ISO-8601",
  "input": {
    "type": "TEXT | URL | IMAGE",
    "displayText": "short safe preview",
    "sourceUrl": "nullable",
    "imageUrl": "nullable",
    "inputHash": "0x..."
  },
  "verdict": "SUPPORTED | UNVERIFIED | MISLEADING | CONTRADICTED",
  "truthScore": 0,
  "confidenceScore": 0,
  "summary": "concise result",
  "claims": [
    {
      "id": "uuid",
      "text": "atomic claim",
      "importance": 1,
      "truthScore": 0,
      "confidenceScore": 0,
      "verdict": "UNVERIFIED",
      "reasoningSummary": "...",
      "claimHash": "0x..."
    }
  ],
  "evidence": [
    {
      "id": "uuid",
      "claimId": "uuid",
      "title": "...",
      "url": "https://...",
      "domain": "example.org",
      "excerpt": "short excerpt",
      "publishedAt": "nullable ISO-8601",
      "retrievedAt": "ISO-8601",
      "direction": "SUPPORTS | OPPOSES | NEUTRAL",
      "relevanceScore": 0,
      "sourceQualityScore": 0,
      "contentHash": "0x..."
    }
  ],
  "modelConsensus": {
    "agreementScore": 0,
    "disagreements": ["..."],
    "kimi": {
      "modelId": "moonshotai/Kimi-K2.6",
      "score": 0,
      "confidence": 0,
      "verdict": "...",
      "reasoningSummary": "...",
      "gonkaResponseId": "msg_..."
    },
    "minimax": {
      "modelId": "MiniMaxAI/MiniMax-M2.7",
      "score": 0,
      "confidence": 0,
      "verdict": "...",
      "reasoningSummary": "...",
      "gonkaResponseId": "msg_..."
    },
    "adversarialChallenges": []
  },
  "integrity": {
    "claimsRoot": "0x...",
    "evidenceRoot": "0x...",
    "kimiOutputHash": "0x...",
    "minimaxOutputHash": "0x...",
    "requestIdsHash": "0x...",
    "passportHash": "0x..."
  },
  "attestation": {
    "status": "CONFIRMED | PENDING | FAILED | DISABLED",
    "network": "ethereum-sepolia",
    "chainId": 11155111,
    "contractAddress": "0x...",
    "transactionHash": "0x...",
    "blockNumber": 0,
    "attestor": "0x...",
    "explorerUrl": "https://sepolia.etherscan.io/tx/0x..."
  }
}
```

---

## 13. Backend Modules

The NestJS backend should have clear modules or equivalent boundaries:

- `ConfigModule`: validated environment configuration.
- `HealthModule`: liveness and dependency checks.
- `VerificationModule`: request validation and orchestration.
- `IngestionModule`: text, URL, and image normalization.
- `StorageModule`: Cloudinary and local/test adapters.
- `GonkaModule`: Anthropic-compatible Gonka client, retries, metrics, structured parsing.
- `ClaimsModule`: claim extraction and persistence.
- `EvidenceModule`: Tavily search/extract, normalization, deduplication, persistence.
- `InvestigationModule`: Kimi, MiniMax, adversarial, and narrative calls.
- `ConsensusModule`: deterministic scoring and verdict calculation.
- `IntegrityModule`: stable serialization, Keccak hashes, Merkle roots, re-verification.
- `PassportModule`: passport assembly, history, public retrieval, badge data.
- `BlockchainModule`: contract calls, confirmation, readback, retry.

Business logic must not live in controllers.

---

## 14. Persistence Model

Use PostgreSQL and migrations. `synchronize` must be disabled outside tests.

### Verification

- `id` UUID primary key
- `inputType`
- `originalText` nullable
- `sourceUrl` nullable
- `imageUrl` nullable
- `normalizedContent`
- `inputHash`
- `status`: `PROCESSING | COMPLETED | FAILED`
- `currentStage`
- `errorCode` nullable
- `errorMessage` nullable
- `startedAt`
- `completedAt` nullable
- timestamps

### Claim

- `id`
- `verificationId`
- `text`
- `normalizedText`
- `context`
- `importance`
- `dateSensitive`
- `searchQueries` JSONB
- `claimHash`
- `truthScore`
- `confidenceScore`
- `verdict`
- `reasoningSummary`

### Evidence

- `id`
- `claimId`
- `title`
- `url`
- `canonicalUrl`
- `domain`
- `excerpt`
- `publishedAt` nullable
- `retrievedAt`
- `direction`
- `tavilyRelevanceScore`
- `sourceQualityScore`
- `contentHash`

### ModelResponse

- `id`
- `verificationId`
- `claimId` nullable
- `agentRole`
- `modelId`
- `gonkaResponseId`
- `providerRequestId` nullable
- `parsedOutput` JSONB
- `rawOutput` text nullable
- `outputHash`
- `inputTokens`
- `outputTokens`
- `latencyMs`
- `retryCount`
- `createdAt`

### Passport

- `id`
- `publicId` unique
- `verificationId` unique
- `version`
- `previousPassportId` nullable
- `schemaVersion`
- `verdict`
- `truthScore`
- `confidenceScore`
- `summary`
- `disagreementSummary`
- `canonicalPayload` JSONB
- all integrity fields
- `createdAt`

### Attestation

- `id`
- `passportId` unique
- `status`
- `network`
- `chainId`
- `contractAddress`
- `transactionHash` nullable
- `blockNumber` nullable
- `attestor` nullable
- `errorMessage` nullable
- `attestedAt` nullable
- timestamps

Indexes should cover `publicId`, `inputHash`, `createdAt`, `status`, and foreign keys.

---

## 15. REST API

Use prefix `/api/v1`. Use Swagger/OpenAPI at `/docs` in non-production or when explicitly enabled.

All normal responses use:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "...",
  "code": "MACHINE_READABLE_CODE",
  "traceId": "...",
  "details": []
}
```

### Required endpoints

#### `POST /api/v1/verifications`

Accept either JSON for text/URL or multipart form data for image.

Fields:

- `inputType`
- `content` for text
- `url` for URL
- `file` for image
- `forceRefresh` optional boolean

The request completes the pipeline synchronously for the MVP. External calls must have timeouts, retries, and stage persistence. Frontend calls the backend directly from the browser so it is not constrained by a Vercel server-function timeout.

Return the complete Evidence Passport.

#### `GET /api/v1/verifications/:id`

Return verification status, stage, and associated passport when available.

#### `GET /api/v1/passports/:publicId`

Return a public Evidence Passport.

#### `GET /api/v1/passports`

Cursor-paginated explorer/history. Filters: verdict, input type, date.

#### `GET /api/v1/passports/:publicId/integrity`

Recompute hashes, read the contract, and return a field-by-field validity report.

#### `POST /api/v1/passports/:publicId/attest`

Retry a failed or disabled attestation. Must be idempotent.

#### `GET /api/v1/passports/:publicId/badge`

Return compact badge JSON for the frontend badge route.

#### `GET /api/v1/health`

Return API, database, Gonka configuration, Tavily configuration, storage configuration, RPC reachability, and contract-code checks without exposing secrets.

### Reuse and versioning

- Calculate `inputHash` before external calls.
- When `forceRefresh=false`, a recent completed passport for the same input may be reused within a configurable cache window.
- When `forceRefresh=true`, create a new passport version linked to the prior passport.
- Never overwrite an existing passport or attestation.

---

## 16. Smart Contract Requirements

Contract name: `MeshAttestationRegistry`.

### Contract behavior

- Solidity `^0.8.24` or the existing compatible compiler.
- Use OpenZeppelin `Ownable` if available.
- Owner can authorize or revoke operator addresses.
- Owner and authorized operators can attest.
- A `passportHash` can be attested only once.
- No upgradeable proxy for the MVP.
- No token, NFT, payment, staking, or wallet-connect requirement.
- Use custom errors and events.

### Suggested structure

```solidity
struct Attestation {
  bytes32 inputHash;
  bytes32 claimsRoot;
  bytes32 evidenceRoot;
  bytes32 kimiOutputHash;
  bytes32 minimaxOutputHash;
  bytes32 requestIdsHash;
  uint8 truthScore;
  uint32 verificationVersion;
  uint64 timestamp;
  address attestor;
}
```

Mapping:

```solidity
mapping(bytes32 passportHash => Attestation) private attestations;
```

Required functions:

- `setOperator(address operator, bool allowed)`
- `attestPassport(...)`
- `exists(bytes32 passportHash)`
- `getAttestation(bytes32 passportHash)`

Required event:

- `PassportAttested(passportHash, claimsRoot, evidenceRoot, truthScore, verificationVersion, attestor, timestamp)`

### Contract tests

Test:

- Deployment and ownership.
- Operator authorization.
- Successful attestation.
- Duplicate attestation rejection.
- Unauthorized caller rejection.
- Truth score greater than 100 rejection.
- Exact storage and event values.
- Readback and existence checks.

### Deployment

Provide:

- Local deployment.
- Ethereum Sepolia deployment.
- ABI export for backend use.
- Optional source verification script.
- A deployment artifact that records chain ID, contract address, transaction hash, and deployer.

---

## 17. Frontend Information Architecture

### `/`

Landing and verification entry point.

Sections:

- Clear headline and one-sentence explanation.
- Text, URL, and image tabs.
- Example claims.
- “How it works” flow.
- Recent public passports.
- Protocol/value explanation.

### `/verify`

May redirect to or reuse the landing verification interface.

### `/p/[publicId]`

Public Evidence Passport page.

Required sections:

- Truth Score gauge.
- Verdict, confidence, generated time, and passport version.
- Input preview.
- Summary.
- Atomic claim cards.
- Supporting/opposing evidence tabs.
- Source dates, quality, relevance, and external links.
- Kimi vs MiniMax comparison.
- Agreement meter and disagreement list.
- Adversarial challenge section.
- Gonka audit IDs.
- Integrity hashes.
- Ethereum Sepolia attestation receipt and explorer links.
- “Verify integrity” action.
- Copy public link.
- Copy badge embed code.
- Disclaimer that the result is evidence-based decision support.

### `/explore`

Paginated public passport explorer with filters.

### `/badge/[publicId]`

Minimal, embeddable route showing Mesh logo/name, verdict, score, timestamp, and link to the full passport. It should work in an iframe.

### `/about`

Concise explanation of multi-model consensus, evidence retrieval, deterministic scoring, privacy, and on-chain hashes.

---

## 18. Frontend Design Requirements

The interface should feel credible, technical, and calm rather than like a crypto casino.

- Dark neutral base with off-white text.
- Green accent for verified integrity and supported claims.
- Amber for uncertainty and disagreement.
- Red only for contradicted/high-risk results.
- Spacious layout, strong typography, subtle grid/mesh motif.
- Rounded but not excessively playful cards.
- Responsive from mobile to desktop.
- WCAG-aware contrast, keyboard navigation, visible focus states.
- Skeletons and a staged verification animation.
- Avoid walls of text; use cards, accordions, tabs, timelines, and concise summaries.
- Never fabricate progress received from the backend. A visual animation may explain likely stages while the synchronous request runs, but label it as processing rather than exact server telemetry.

Recommended components:

- `VerificationComposer`
- `TextVerificationForm`
- `UrlVerificationForm`
- `ImageDropzone`
- `VerificationProgress`
- `TruthScoreGauge`
- `VerdictBadge`
- `ClaimCard`
- `EvidenceList`
- `ModelComparison`
- `DisagreementPanel`
- `AdversarialPanel`
- `IntegrityPanel`
- `AttestationReceipt`
- `SharePassport`
- `PassportBadge`
- `RecentPassports`

---

## 19. Security and Privacy

- No secrets in source control, client bundles, logs, screenshots, fixtures, or documentation examples.
- Gonka, Tavily, Cloudinary secret, database URL, signer private key, and RPC credentials are backend-only.
- Use a dedicated testnet-only deployer/attestor wallet. Never use a wallet that holds mainnet assets.
- Restrict CORS to configured web origins.
- Apply request-size and file-size limits.
- Validate URL schemes; block local-network, loopback, metadata-service, and private-IP targets to reduce SSRF risk.
- Sanitize displayed user and evidence content.
- Do not render arbitrary HTML from extracted pages.
- Rate-limit verification endpoints.
- Do not expose full model raw outputs publicly by default.
- Do not store complete page contents longer than required. Persist short excerpts and hashes.
- Remove image metadata when practical before public display.
- Add a content disclaimer and a mechanism to hide the original input preview while preserving hashes.

---

## 20. Reliability and Observability

- Config validation must fail fast with a readable list of missing variables.
- External calls require timeouts and exponential backoff with jitter.
- Retry `429` and transient `5xx` responses; do not retry invalid requests indefinitely.
- Gonka documentation indicates `429` responses should be backed off for roughly 30–60 seconds. Keep retries configurable and reasonable for the demo.
- Store the current pipeline stage before and after each external step.
- Add a `traceId` to logs and API errors.
- Log model ID, response ID, latency, token usage, and status without logging secret keys or entire private inputs.
- Gracefully shut down the Nest application and database connections.
- A failed attestation must not delete a completed off-chain passport.

---

## 21. Environment Variables

Each app must include a complete `.env.example`. At minimum:

### Backend

```dotenv
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
WEB_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://mesh:mesh@localhost:5432/mesh

GONKA_BASE_URL=https://api.gonkarouter.io
GONKA_API_KEY=
GONKA_KIMI_MODEL=moonshotai/Kimi-K2.6
GONKA_KIMI_FALLBACK_MODEL=MiniMaxAI/MiniMax-M2.7
GONKA_MINIMAX_MODEL=MiniMaxAI/MiniMax-M2.7
GONKA_MAX_TOKENS=4096
GONKA_TIMEOUT_MS=120000

TAVILY_API_KEY=
TAVILY_SEARCH_DEPTH=advanced
TAVILY_MAX_RESULTS_PER_CLAIM=5

STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAX_IMAGE_BYTES=5242880

ATTESTATION_ENABLED=true
ATTESTATION_NETWORK=ethereum-sepolia
ATTESTATION_CHAIN_ID=11155111
ATTESTATION_RPC_URL=https://rpc.sepolia.org
ATTESTATION_EXPLORER_URL=https://sepolia.etherscan.io
MESH_CONTRACT_ADDRESS=
ATTESTOR_PRIVATE_KEY=
ATTESTATION_CONFIRMATIONS=1

PASSPORT_REUSE_WINDOW_MINUTES=60
RATE_LIMIT_TTL_MS=60000
RATE_LIMIT_MAX=20
SWAGGER_ENABLED=true
```

### Contract

```dotenv
ETHEREUM_SEPOLIA_RPC_URL=https://rpc.sepolia.org
DEPLOYER_PRIVATE_KEY=
INITIAL_OWNER_ADDRESS=
INITIAL_OPERATOR_ADDRESS=
ETHERSCAN_API_KEY=
```

### Web

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ATTESTATION_CHAIN_ID=11155111
NEXT_PUBLIC_ATTESTATION_EXPLORER_URL=https://sepolia.etherscan.io
NEXT_PUBLIC_MESH_CONTRACT_ADDRESS=
```

Only variables beginning with `NEXT_PUBLIC_` may enter the browser bundle.

---

## 22. Testing Requirements

### Backend unit tests

- Stable JSON canonicalization.
- Hash and Merkle root determinism.
- Claim and evidence leaf construction.
- Consensus formula boundaries and weighted scores.
- Verdict band mapping.
- URL normalization and SSRF guard.
- Gonka content-block extraction and structured-output parsing.
- Tavily result normalization and deduplication.
- Attestation idempotency.

### Backend integration/E2E tests

Use test doubles for Gonka, Tavily, storage, and RPC so CI does not require paid credentials.

Test:

- Text verification success.
- URL verification success.
- Image verification success.
- No factual claims.
- Invalid model JSON and repair.
- Tavily failure.
- Gonka timeout and retry.
- Attestation failure with completed passport.
- Integrity check success and mismatch.
- Reuse and force-refresh versioning.

### Contract tests

As defined in Section 16.

### Frontend tests

- Form validation.
- Image limits.
- Successful result rendering.
- Error rendering and retry.
- Score and verdict accessibility.
- Public passport page.
- Copy/share actions.
- Integrity verification interaction.
- Badge route.

### Real smoke tests

Provide scripts or documented commands that exercise:

- Gonka Kimi “pong” call.
- Gonka MiniMax “pong” call.
- Tavily search and extract.
- Local contract deployment and readback.
- Ethereum Sepolia deployment.
- Complete text verification.
- Complete URL verification.
- Complete image verification.
- On-chain integrity verification.
- Browser E2E flow.

---

## 23. Definition of Done

The project is done only when:

- All three apps install and build from the repository root.
- Lint and type checks pass.
- Unit and E2E tests pass.
- Database migrations run from an empty database.
- Both Gonka models are called with exact documented model IDs.
- Every inference is routed through Gonka.
- Tavily supplies real-time evidence.
- A text, URL, and image can complete the flow.
- The score is computed by the documented deterministic formula.
- Gonka audit IDs are displayed.
- The smart contract is tested and deployable to Ethereum Sepolia.
- A passport can be attested and independently checked.
- `.env.example` files contain every variable with comments or documentation.
- No real secrets are committed.
- README/setup documentation explains local run, testing, contract deployment, backend deployment, and frontend deployment.
- The coding agent reports exactly what it changed, which commands it ran, test results, environment variables the user must supply, and any external manual action still required.

---

## 24. Three-Minute Demo Script

1. Open Mesh and paste a believable viral claim or screenshot.
2. Start verification and show the pipeline stages.
3. Reveal the extracted atomic claims.
4. Show supporting and opposing live sources.
5. Show Kimi and MiniMax’s independent scores, including a disagreement.
6. Expand the adversarial challenge that explains why the result is not absolute.
7. Reveal the final Truth Score and verdict.
8. Open the Integrity panel and show the Gonka response IDs and hashes.
9. Publish or display the Ethereum Sepolia attestation.
10. Open the transaction in the explorer.
11. Run “Verify integrity” and show every hash matching.
12. Copy the public passport link or badge embed.

Closing line:

> Mesh gives every digital claim a portable evidence passport that people, applications, and AI agents can independently audit instead of restarting verification from zero.

---

## 25. Roadmap After the MVP

- TypeScript SDK.
- MCP server for AI agents.
- Browser extension.
- Additional messaging integrations such as WhatsApp.
- Signed publisher and expert attestations.
- Claim clustering and reuse across semantically equivalent posts.
- Evidence update alerts and passport version timelines.
- Community challenges and appeal workflows without token incentives.
- Additional Gonka models and weighted model panels.
- Decentralized content storage for explicitly public evidence snapshots.

---

## 26. Official References Used for This Specification

- Gonka Router home: `https://gonkarouter.io/`
- Gonka Router integration guide: `https://gonkarouter.io/docs`
- Gonka Router model list: `https://gonkarouter.io/models`
- Gonka Router pricing: `https://gonkarouter.io/pricing`
- Tavily JavaScript quickstart: `https://docs.tavily.com/sdk/javascript/quick-start`
- Tavily JavaScript reference: `https://docs.tavily.com/sdk/javascript/reference`
- Ethereum Sepolia network configuration: `https://ethereum.org/developers/docs/networks/`
- Ethereum Sepolia faucets: `https://ethereum.org/developers/docs/networks/#sepolia`
- Hardhat documentation: `https://hardhat.org/docs/getting-started`

When implementation details conflict with live official documentation, the live official documentation wins. Do not invent Gonka endpoints, model names, headers, image formats, or response fields.
