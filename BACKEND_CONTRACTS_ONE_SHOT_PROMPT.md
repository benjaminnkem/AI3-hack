# One-Shot Build Prompt: Mesh Backend and Smart Contract

Paste this prompt into Codex or Claude Code from the root of the existing Turborepo. Place `MESH_PRD.md` in the repository first, preferably at `docs/MESH_PRD.md`.

---

You are the principal backend and smart-contract engineer responsible for finishing the Mesh hackathon MVP inside this existing Turborepo.

This is an implementation task. Do not stop after analysis, planning, scaffolding, pseudocode, or a list of suggested files. Inspect the repository, implement the complete backend and contract flow, run the available validation commands, fix failures, and leave the codebase in a runnable state.

## Source of truth

1. Find and read `MESH_PRD.md`, preferably at `docs/MESH_PRD.md`.
2. Inspect the repository root, `turbo.json`, workspace config, lockfile, root scripts, shared TypeScript/lint config, `apps/backend`, and `apps/contract` before modifying anything.
3. Read the current official Gonka pages before implementing the client:
   - `https://gonkarouter.io/`
   - `https://gonkarouter.io/docs`
   - `https://gonkarouter.io/models`
4. Use the PRD as the product and API contract. Where the repository already has a reasonable convention, preserve it. Where the repository is empty, use the preferred stack in the PRD.
5. Do not invent any Gonka endpoint, model ID, auth header, response field, or capability. If live documentation differs from the PRD, use the live official documentation and record the difference in your completion report.

## Repository boundaries

Focus on:

- `apps/backend`
- `apps/contract`
- only the minimum root workspace changes required for scripts, task dependencies, Docker Compose, formatting, or documentation

Do not implement the web UI in this task. You may generate Swagger/OpenAPI and stable response types needed by the frontend.

Do not delete or replace working repository configuration. Do not change package manager. Do not add microservices, Redis, Kafka, RabbitMQ, a vector database, or Kubernetes.

## Mandatory external architecture

- Every LLM inference call must use Gonka Router.
- Use Gonka’s Anthropic-compatible `POST /v1/messages` surface through `@anthropic-ai/sdk` unless the existing backend has a stronger compatible abstraction.
- Gonka base URL: `https://api.gonkarouter.io`.
- Kimi model: `moonshotai/Kimi-K2.6`.
- MiniMax model: `MiniMaxAI/MiniMax-M2.7`.
- Default `max_tokens`: `4096`, never below `1024`.
- Store the Gonka response body `id` as the primary audit ID. Also store a header request ID if the SDK exposes one, but do not require it.
- Use Tavily via `@tavily/core` for live search and URL extraction. Tavily is retrieval, not AI inference.
- Use PostgreSQL and real migrations.
- Use Base Sepolia, chain ID `84532`, for attestations.
- Use a storage adapter: local filesystem in development/test and Cloudinary when configured in deployment.

## Implementation behavior

Implement the entire synchronous verification pipeline described in the PRD:

1. Validate and normalize text, URL, or image input.
2. Protect URL fetching against SSRF and unsupported schemes.
3. Extract URL content with Tavily Extract and use Tavily Search as fallback.
4. For image input, upload/store the image and run a neutral Kimi visual-normalization call through Gonka.
5. Run MiniMax claim extraction and return 1–5 atomic claims with search queries.
6. Retrieve and deduplicate supporting and opposing evidence with Tavily.
7. Run Kimi and MiniMax investigators independently and in parallel.
8. Run the adversarial reviewer through Gonka.
9. Validate every model output with Zod. Implement one Gonka repair attempt for invalid JSON. Never create fake fallback verdicts.
10. Calculate claim and overall Truth Scores deterministically using the exact formula in the PRD.
11. Run a final Gonka narrative call only to explain the already-computed result. It may not alter scores or verdicts.
12. Build the canonical Evidence Passport.
13. Generate stable Keccak-256 hashes and Merkle roots.
14. Persist all normalized entities and stage status.
15. Attest the compact passport data through the Base Sepolia registry.
16. Return the complete public Evidence Passport.
17. Implement independent integrity recomputation and contract readback.
18. Support failed-attestation retry, recent-result reuse, and force-refresh versioning.

## Backend quality requirements

Use clean NestJS module boundaries and dependency injection. Controllers should validate/route; services own business logic. Implement, at minimum, modules equivalent to:

- config
- health
- verification
- ingestion
- storage
- gonka
- claims
- evidence
- investigation
- consensus
- integrity
- passport
- blockchain

If the current backend is not NestJS but already has a complete coherent framework setup, do not rewrite it merely to satisfy a name. Preserve the framework while preserving the same boundaries and behavior. If it is empty, implement NestJS.

Add:

- global validation pipe
- global exception filter with `traceId`
- response envelope interceptor or equivalent
- structured logs with no secrets
- CORS from configuration
- security headers
- request/file size limits
- API rate limiting
- Swagger/OpenAPI
- graceful shutdown
- TypeORM migrations and indexes
- health checks that do not expose secrets

Use strict TypeScript. Avoid `any`; isolate unavoidable third-party typing with narrow adapters.

## API contract

Implement all endpoints from the PRD under `/api/v1`:

- `POST /verifications`
- `GET /verifications/:id`
- `GET /passports/:publicId`
- `GET /passports`
- `GET /passports/:publicId/integrity`
- `POST /passports/:publicId/attest`
- `GET /passports/:publicId/badge`
- `GET /health`

Support JSON requests for text/URL and multipart requests for images. Generate accurate Swagger schemas and examples.

Use the response format:

```json
{ "success": true, "message": "...", "data": {} }
```

and error format:

```json
{
  "success": false,
  "message": "...",
  "code": "...",
  "traceId": "...",
  "details": []
}
```

## Gonka client implementation

Create one reusable Gonka client/service. It must:

- initialize the official Anthropic TypeScript SDK with `baseURL` from config
- never expose the API key
- accept model, system prompt, content blocks, max tokens, and timeout
- support Kimi image blocks using the Anthropic-compatible image format documented by the SDK
- extract and join text blocks safely
- capture body response ID, optional provider request ID, usage, latency, and retries
- retry transient `429` and `5xx` failures with exponential backoff and jitter
- fail clearly on invalid auth, invalid model, and timeout
- accept an injectable transport/client so unit tests never call the real service

Create separate Zod schemas and prompt templates for:

- neutral visual normalization
- claim extraction
- investigator output
- adversarial review
- final narrative

The prompts must request concise reasoning summaries, not hidden chain-of-thought.

## Tavily implementation

Create a reusable Tavily service using `@tavily/core`.

- `extract` for submitted URLs
- `search` for evidence
- advanced search by default, configurable
- max five results per claim by default
- news topic for date-sensitive claims
- URL/domain deduplication
- short excerpts only in persistent/public data
- relevance and request IDs where available
- injectable client for tests

Do not call any third-party LLM through Tavily or another provider.

## Consensus and integrity implementation

Implement the PRD formula exactly with pure, well-tested functions. Do not ask the final LLM to choose the numeric score.

Use canonical JSON serialization with recursively sorted keys. Define explicitly which fields enter every hash. Use Keccak-256 and deterministic Merkle leaf ordering. Empty evidence/claim lists must have a defined deterministic root.

The integrity endpoint must return:

- recomputed value
- stored value
- on-chain value where applicable
- individual `matches` booleans
- final `valid` boolean

## Smart contract

Inspect `apps/contract` and preserve the existing Hardhat or Foundry toolchain. If it is not configured, use Hardhat 3 with TypeScript and an official toolbox compatible with the repository’s Node/package versions.

Implement `MeshAttestationRegistry` exactly as required by the PRD:

- owner/operator authorization
- one attestation per passport hash
- compact struct and mapping
- custom errors
- `PassportAttested` event
- `exists` and `getAttestation`
- no token, NFT, upgradeable proxy, payment, or wallet-connect functionality

Use OpenZeppelin contracts where appropriate.

Create:

- comprehensive unit tests
- local deployment script/module
- Base Sepolia deployment script/module
- operator setup script
- contract verification command/config when supported
- ABI export into a stable backend location
- deployment JSON output containing address, chain ID, deploy tx, and timestamp

The backend blockchain adapter must use the generated ABI, verify bytecode exists at startup/health check when attestation is enabled, wait for configurable confirmations, and read the stored attestation back after writing.

## Environment and local infrastructure

Create complete `.env.example` files for backend and contract. Include every variable in the PRD and any additional variable you truly require. For every variable, document:

- whether it is required
- what it controls
- how the user obtains it
- safe local/demo default if one exists
- whether it is secret

Never write real secret values.

Add or update a root `docker-compose.yml` for PostgreSQL only if one does not already exist. Use a health check and a named volume. Do not add unnecessary infrastructure.

Add useful scripts without breaking existing ones. Ensure root Turbo tasks can run build, lint, typecheck, and test for both apps.

## Tests and validation

Create and run:

### Backend unit tests

- canonical JSON
- hashes and Merkle roots
- consensus formula and all score boundaries
- verdict mapping
- URL normalization and SSRF guards
- model block extraction
- JSON parsing and repair path
- Tavily normalization/deduplication
- attestation idempotency

### Backend E2E tests

Use deterministic fake adapters for Gonka, Tavily, storage, and blockchain. Cover:

- text success
- URL success
- image success
- no factual claim
- malformed model JSON then successful repair
- external timeout/failure
- failed attestation while passport remains available
- integrity success and mismatch
- reuse and force-refresh versioning

### Contract tests

Cover every case in the PRD.

### Build validation

Run the repository’s actual equivalents of:

- install only if dependencies are missing
- formatting check
- lint
- typecheck
- backend unit tests
- backend E2E tests
- contract compile
- contract tests
- production build

Do not claim a command passed unless you ran it. Fix failures that are caused by your changes. If an external credential is unavailable, run all mocked/local tests and provide a real-service smoke-test command.

## Documentation to create or update

Create backend/contract documentation that includes:

- architecture and module flow
- exact environment setup
- PostgreSQL startup and migrations
- Gonka smoke tests for both model IDs
- Tavily smoke test
- local contract deployment
- Base Sepolia wallet/faucet/RPC setup
- Base Sepolia deployment and optional source verification
- adding the deployed contract address to backend env
- text, URL, and image curl examples
- integrity verification example
- test commands
- deployment guidance
- troubleshooting for invalid model ID, 401, 429, image failure, RPC failure, insufficient test ETH, and contract mismatch

## Rules for completing the task

- Do not ask me to manually create ordinary source files that you can create.
- Do not use placeholders, fake model responses in production code, or TODO implementations for required behavior.
- Test doubles are allowed only in test code or an explicitly selected local demo adapter; production defaults must use real services.
- Do not commit secrets.
- Do not silently weaken requirements to make tests pass.
- Do not stop at the first compile error; iterate until the project is as complete and valid as the local environment allows.
- Do not rewrite unrelated files.

## Required final response

After implementation, give me a structured completion report containing:

1. What you built, organized by backend and contract.
2. Important architectural decisions and why.
3. Every file added or materially changed.
4. Database schema and migrations created.
5. API endpoints and example request formats.
6. Smart-contract address if you were able to deploy; otherwise the exact deployment command.
7. Every environment variable, where to obtain it, and which `.env` file receives it.
8. Exact commands to install, migrate, run, test, deploy, and smoke-test.
9. Tests and build commands actually run, with pass/fail results.
10. External actions I still need to perform, such as creating API keys, funding a dedicated Base Sepolia wallet, deploying the contract, or setting production URLs.
11. Known limitations that remain, without hiding them.

Begin by inspecting the repository and reading the PRD, then implement the entire backend and contract task now.
