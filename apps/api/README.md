# Mesh API

NestJS/PostgreSQL implementation of the synchronous Mesh Evidence Passport pipeline.

New to Web3? Start with the [beginner environment and testing guide](../../ENVIRONMENT_AND_TESTING_GUIDE.md) before configuring attestation.

## Architecture

`POST /api/v1/verifications` flows through ingestion, claim extraction, evidence retrieval, two parallel investigators, adversarial review, deterministic consensus, final narrative, integrity hashing, persistence, then optional Ethereum Sepolia attestation. Controllers only route and validate. Gonka calls are centralized in `GonkaClient`; Tavily is configured with `includeAnswer: false` and is only used for extract/search.

The integrity implementation uses recursively sorted JSON object keys, preserved array order, Keccak-256 leaves, lexicographically sorted Merkle levels, duplicated odd leaves, and `keccak256(empty bytes)` for an empty tree. Claim leaves contain `id`, `text`, `importance`, `claimHash`, `truthScore`, `confidenceScore`, and `verdict`. Evidence leaves contain `id`, `claimId`, `canonicalUrl`, `contentHash`, `direction`, `relevanceScore`, and `sourceQualityScore`. The passport payload excludes its own hash and all mutable transaction fields.

## Setup

```bash
cp apps/api/.env.example apps/api/.env
docker compose up -d postgres
pnpm install
pnpm --filter @mesh/api migration:run
pnpm --filter @mesh/api dev
```

Swagger is at `http://localhost:4000/docs`. Production always uses migrations; TypeORM synchronization is disabled except under `NODE_ENV=test`.

## Environment

- `NODE_ENV`, `PORT`, `API_PREFIX`: runtime mode, listener and global route prefix; safe defaults exist.
- `WEB_ORIGINS`: comma-separated allowed browser origins; set to deployed web origins.
- `DATABASE_URL`: PostgreSQL connection string. The Compose default is safe locally; deployment credentials are secret.
- `GONKA_BASE_URL`: official Anthropic-compatible root, `https://api.gonkarouter.io`.
- `GONKA_API_KEY`: required secret created in the [Gonka Router dashboard](https://gonkarouter.io/).
- `GONKA_KIMI_MODEL`, `GONKA_MINIMAX_MODEL`: fixed live IDs `moonshotai/Kimi-K2.6` and `MiniMaxAI/MiniMax-M2.7`.
- `GONKA_MAX_TOKENS`, `GONKA_TIMEOUT_MS`, `GONKA_MAX_RETRIES`, `GONKA_RETRY_BASE_MS`: output, timeout and transient retry controls. Keep tokens at least 1024; default is 4096.
- `TAVILY_API_KEY`: required secret from [Tavily](https://app.tavily.com/).
- `TAVILY_SEARCH_DEPTH`, `TAVILY_MAX_RESULTS_PER_CLAIM`: retrieval controls; `advanced` and 5 are defaults.
- `STORAGE_DRIVER`: `local` or `cloudinary`; local is safe for development.
- `UPLOAD_DIR`, `MAX_IMAGE_BYTES`: local directory and image cap.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: required when Cloudinary is selected; obtain from its console. API secret is secret.
- `ATTESTATION_ENABLED`: disabled safely until a registry is deployed.
- `ATTESTATION_NETWORK`: fixed to `ethereum-sepolia`.
- `ATTESTATION_CHAIN_ID`: fixed to Ethereum Sepolia `11155111`.
- `ATTESTATION_RPC_URL`: public default works for demos; use an Alchemy/Infura/QuickNode endpoint for deployment reliability.
- `ATTESTATION_EXPLORER_URL`: Etherscan URL used for receipts.
- `MESH_CONTRACT_ADDRESS`: public address produced by the contract deployment.
- `ATTESTOR_PRIVATE_KEY`: secret for a dedicated Ethereum-Sepolia-only authorized operator. Never use a mainnet wallet.
- `ATTESTATION_CONFIRMATIONS`: blocks to wait before readback.
- `PASSPORT_REUSE_WINDOW_MINUTES`: recent exact-input reuse window.
- `RATE_LIMIT_TTL_MS`, `RATE_LIMIT_MAX`: process-local API limiter controls.
- `SWAGGER_ENABLED`: disable docs in production if desired.

## API examples

```bash
curl -X POST http://localhost:4000/api/v1/verifications \
  -H 'content-type: application/json' \
  -d '{"inputType":"TEXT","content":"The Great Wall is visible from the Moon with the naked eye."}'

curl -X POST http://localhost:4000/api/v1/verifications \
  -H 'content-type: application/json' \
  -d '{"inputType":"URL","url":"https://example.org/article","forceRefresh":true}'

curl -X POST http://localhost:4000/api/v1/verifications \
  -F inputType=IMAGE -F file=@./screenshot.png

curl http://localhost:4000/api/v1/verifications/VERIFICATION_UUID
curl http://localhost:4000/api/v1/passports/PUBLIC_ID
curl 'http://localhost:4000/api/v1/passports?limit=20&verdict=SUPPORTED'
curl http://localhost:4000/api/v1/passports/PUBLIC_ID/integrity
curl -X POST http://localhost:4000/api/v1/passports/PUBLIC_ID/attest
curl http://localhost:4000/api/v1/passports/PUBLIC_ID/badge
curl http://localhost:4000/api/v1/health
```

## Real-service smoke tests

Both calls use the documented Anthropic Messages surface and store the response body `id` in normal pipeline runs:

```bash
curl https://api.gonkarouter.io/v1/messages -H "x-api-key: $GONKA_API_KEY" \
  -H 'anthropic-version: 2023-06-01' -H 'content-type: application/json' \
  -d '{"model":"moonshotai/Kimi-K2.6","max_tokens":1024,"messages":[{"role":"user","content":"Reply with just: pong"}]}'

curl https://api.gonkarouter.io/v1/messages -H "x-api-key: $GONKA_API_KEY" \
  -H 'anthropic-version: 2023-06-01' -H 'content-type: application/json' \
  -d '{"model":"MiniMaxAI/MiniMax-M2.7","max_tokens":1024,"messages":[{"role":"user","content":"Reply with just: pong"}]}'

curl https://api.tavily.com/search -H 'content-type: application/json' \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{"query":"Ethereum Sepolia chain id","search_depth":"advanced","max_results":2,"include_answer":false}'
```

## Validation and deployment

```bash
pnpm --filter @mesh/api lint
pnpm --filter @mesh/api typecheck
pnpm --filter @mesh/api test:unit
pnpm --filter @mesh/api test:e2e
pnpm --filter @mesh/api build
NODE_ENV=production pnpm --filter @mesh/api start
```

Deploy behind a reverse proxy with request timeouts above `GONKA_TIMEOUT_MS`, persistent storage or Cloudinary, a managed PostgreSQL database, restricted CORS, and secrets supplied by the platform secret manager.

## Troubleshooting

- `401`: create/rotate `GONKA_API_KEY`; do not use an Anthropic key.
- Invalid model: IDs are case-sensitive; copy the two values from `.env.example`.
- `429`: the client backs off with exponential delay beginning at 30 seconds.
- Image failure: confirm PNG/JPEG/WebP, <=5 MiB, Kimi model ID, and Cloudinary credentials when selected.
- Tavily extraction failure: the URL path automatically falls back to search; private/local destinations are rejected before retrieval.
- RPC failure: replace the public RPC, verify chain ID 11155111, and retry the passport attestation.
- Insufficient ETH: fund the dedicated operator from an Ethereum Sepolia faucet.
- Contract mismatch: ensure `MESH_CONTRACT_ADDRESS` is the 11155111 deployment and `/health` reports contract bytecode.
