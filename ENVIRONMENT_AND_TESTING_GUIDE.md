# Mesh Environment Setup and End-to-End Testing Guide

This guide describes the target developer experience that the coding agents should implement and document. Adapt command names to the existing workspace scripts rather than replacing a working setup.

---

## 1. Prerequisites

Install:

- Node.js `22.13.0` or newer. This satisfies current Hardhat 3 requirements and works well across the monorepo.
- pnpm through Corepack, unless the existing repository lockfile uses another package manager.
- Docker Desktop or another Docker Compose-compatible runtime.
- Git.
- A browser supported by Playwright.

Check:

```bash
node --version
corepack enable
pnpm --version
docker --version
docker compose version
```

Use the existing lockfile. Do not delete it or switch package managers.

---

## 2. Accounts and Credentials

### Gonka Router

1. Open the Gonka Router dashboard from `https://gonkarouter.io/`.
2. Sign in and create an API key.
3. Put it only in `apps/backend/.env` as `GONKA_API_KEY`.
4. Never put it in `apps/web/.env` or any `NEXT_PUBLIC_` variable.

The application uses:

- `moonshotai/Kimi-K2.6`
- `MiniMaxAI/MiniMax-M2.7`

### Tavily

1. Create a Tavily account/API key.
2. Put it in `apps/backend/.env` as `TAVILY_API_KEY`.

Tavily is used for current web search and URL extraction. It is not used as an LLM provider.

### Cloudinary

Cloudinary is optional for text/URL-only local development and required for persistent deployed image uploads when `STORAGE_DRIVER=cloudinary`.

Set:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Keep the secret backend-only.

### Base Sepolia

Create a new wallet used only for testnet deployment and attestation. Do not reuse a wallet that holds mainnet assets.

You need:

- its private key in the relevant local `.env` file
- Base Sepolia test ETH from a faucet
- an RPC URL

For a demo, the public RPC is:

```text
https://sepolia.base.org
```

Base Sepolia chain ID:

```text
84532
```

For more reliable deployment, use a provider-specific Base Sepolia RPC URL.

---

## 3. Repository Environment Files

Copy examples after the agent creates them:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/contract/.env.example apps/contract/.env
cp apps/web/.env.example apps/web/.env.local
```

### Backend local development

```dotenv
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
WEB_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://mesh:mesh@localhost:5432/mesh

GONKA_BASE_URL=https://api.gonkarouter.io
GONKA_API_KEY=replace_me
GONKA_KIMI_MODEL=moonshotai/Kimi-K2.6
GONKA_MINIMAX_MODEL=MiniMaxAI/MiniMax-M2.7
GONKA_MAX_TOKENS=4096
GONKA_TIMEOUT_MS=120000

TAVILY_API_KEY=replace_me
TAVILY_SEARCH_DEPTH=advanced
TAVILY_MAX_RESULTS_PER_CLAIM=5

STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
MAX_IMAGE_BYTES=5242880

ATTESTATION_ENABLED=false
BASE_CHAIN_ID=84532
BASE_RPC_URL=https://sepolia.base.org
BASE_EXPLORER_URL=https://sepolia.basescan.org
MESH_CONTRACT_ADDRESS=
ATTESTOR_PRIVATE_KEY=
ATTESTATION_CONFIRMATIONS=1

PASSPORT_REUSE_WINDOW_MINUTES=60
RATE_LIMIT_TTL_MS=60000
RATE_LIMIT_MAX=20
SWAGGER_ENABLED=true
```

Start locally with `ATTESTATION_ENABLED=false` until the contract is deployed. This lets the complete off-chain flow run and returns an explicit disabled attestation state.

### Contract local/Base Sepolia

```dotenv
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=0x_replace_with_testnet_only_key
INITIAL_OWNER_ADDRESS=0x_replace_with_owner
INITIAL_OPERATOR_ADDRESS=0x_replace_with_backend_attestor
ETHERSCAN_API_KEY=
```

For the simplest demo, deployer, owner, and backend attestor can be the same dedicated testnet wallet. A separate operator is cleaner but not mandatory.

### Web local development

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_CHAIN_ID=84532
NEXT_PUBLIC_BASE_EXPLORER_URL=https://sepolia.basescan.org
NEXT_PUBLIC_MESH_CONTRACT_ADDRESS=
```

---

## 4. Install and Start PostgreSQL

From repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
```

Start PostgreSQL using the repository Compose file:

```bash
docker compose up -d postgres
docker compose ps
```

Run backend migrations with the script created by the agent. Typical form:

```bash
pnpm --dir apps/backend run migration:run
```

Check migration status if a script is provided:

```bash
pnpm --dir apps/backend run migration:show
```

---

## 5. Gonka Smoke Tests Before Starting the App

The official Gonka Anthropic-compatible endpoint is `https://api.gonkarouter.io/v1/messages`.

### Kimi

```bash
export GONKA_API_KEY='replace_me'

curl -s https://api.gonkarouter.io/v1/messages \
  -H "x-api-key: $GONKA_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "moonshotai/Kimi-K2.6",
    "max_tokens": 1024,
    "messages": [{"role":"user","content":"Reply with just: pong"}]
  }'
```

Confirm:

- HTTP 200
- response `id` begins with or resembles `msg_...`
- `content` contains a text block

### MiniMax

```bash
curl -s https://api.gonkarouter.io/v1/messages \
  -H "x-api-key: $GONKA_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "MiniMaxAI/MiniMax-M2.7",
    "max_tokens": 1024,
    "messages": [{"role":"user","content":"Reply with just: pong"}]
  }'
```

Common failures:

- `401`: wrong or missing API key.
- model unavailable: model ID is case-sensitive and must include the provider prefix.
- truncated/empty useful output: increase `max_tokens`; keep it at least 1024.
- `429`: back off and retry rather than sending rapid repeated requests.

---

## 6. Tavily Smoke Test

After the backend agent creates a smoke script, prefer running it. A simple direct SDK test can look like:

```bash
TAVILY_API_KEY='replace_me' node - <<'NODE'
const { tavily } = require('@tavily/core');
const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
client.search('Base Sepolia chain id', { maxResults: 3, searchDepth: 'basic' })
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => { console.error(error); process.exit(1); });
NODE
```

Run it from a directory where `@tavily/core` is installed, normally `apps/backend`, or use the repository smoke script.

---

## 7. Compile and Test the Contract

Use scripts from `apps/contract/package.json`. Typical commands:

```bash
pnpm --dir apps/contract run compile
pnpm --dir apps/contract run test
```

Start a local EVM node when supported:

```bash
pnpm --dir apps/contract run node
```

In another terminal, deploy locally:

```bash
pnpm --dir apps/contract run deploy:local
```

Confirm the deployment output includes:

- contract address
- chain ID
- deployment transaction
- owner/operator
- path to exported ABI

---

## 8. Deploy to Base Sepolia

1. Fund the dedicated testnet wallet with Base Sepolia ETH.
2. Set `BASE_SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` in `apps/contract/.env`.
3. Deploy:

```bash
pnpm --dir apps/contract run deploy:base-sepolia
```

4. Optionally verify the source using the script created by the agent:

```bash
pnpm --dir apps/contract run verify:base-sepolia -- <CONTRACT_ADDRESS>
```

5. Copy the contract address into:

`apps/backend/.env`

```dotenv
ATTESTATION_ENABLED=true
MESH_CONTRACT_ADDRESS=0x_deployed_address
ATTESTOR_PRIVATE_KEY=0x_testnet_only_operator_private_key
```

`apps/web/.env.local`

```dotenv
NEXT_PUBLIC_MESH_CONTRACT_ADDRESS=0x_deployed_address
```

6. Ensure the address corresponding to `ATTESTOR_PRIVATE_KEY` is the owner or an authorized operator.
7. Restart backend and web after changing environment variables.

---

## 9. Run the Applications

Run all apps through the root Turbo script when available:

```bash
pnpm dev
```

Or separately:

```bash
pnpm --dir apps/backend run start:dev
pnpm --dir apps/web run dev
```

Expected local URLs:

- Web: `http://localhost:3000`
- Backend: `http://localhost:4000`
- API: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/docs`

Health check:

```bash
curl -s http://localhost:4000/api/v1/health | jq
```

Health must not print secret values.

---

## 10. Test the Complete API Flow

The exact request shape must match generated Swagger. These examples represent the intended contract.

### Text verification

```bash
curl -X POST http://localhost:4000/api/v1/verifications \
  -H 'content-type: application/json' \
  -d '{
    "inputType": "TEXT",
    "content": "Nigeria has declared tomorrow a nationwide public holiday.",
    "forceRefresh": true
  }' | tee /tmp/mesh-text.json
```

Confirm the response contains:

- `success: true`
- `data.passport.publicId`
- 1–5 claims
- evidence
- Kimi and MiniMax model IDs
- Gonka response IDs
- deterministic truth and confidence scores
- integrity hashes
- confirmed or explicitly disabled/failed attestation

### URL verification

```bash
curl -X POST http://localhost:4000/api/v1/verifications \
  -H 'content-type: application/json' \
  -d '{
    "inputType": "URL",
    "url": "https://example.com/article",
    "forceRefresh": true
  }' | tee /tmp/mesh-url.json
```

Use a real public page for the demo.

### Image verification

```bash
curl -X POST http://localhost:4000/api/v1/verifications \
  -F 'inputType=IMAGE' \
  -F 'forceRefresh=true' \
  -F 'file=@./path/to/test-screenshot.png' \
  | tee /tmp/mesh-image.json
```

Confirm the visual-normalization and Kimi investigation calls exist in stored model responses.

### Fetch passport

```bash
PUBLIC_ID=$(jq -r '.data.passport.publicId' /tmp/mesh-text.json)
curl -s "http://localhost:4000/api/v1/passports/$PUBLIC_ID" | jq
```

### Verify integrity

```bash
curl -s "http://localhost:4000/api/v1/passports/$PUBLIC_ID/integrity" | jq
```

A successful attested result should return `valid: true` and matching stored/recomputed/on-chain fields.

### Retry attestation

```bash
curl -X POST "http://localhost:4000/api/v1/passports/$PUBLIC_ID/attest" | jq
```

Calling this repeatedly must be safe and must not create conflicting duplicate attestations.

---

## 11. Automated Test Suite

Run the actual scripts created by the agents. Target commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

App-specific:

```bash
pnpm --dir apps/backend run test
pnpm --dir apps/backend run test:e2e
pnpm --dir apps/contract run test
pnpm --dir apps/web run test
pnpm --dir apps/web run test:e2e
pnpm --dir apps/web run build
pnpm --dir apps/backend run build
```

External services must be mocked in CI tests. Real-service smoke tests should be separately gated, for example:

```bash
RUN_REAL_EXTERNAL_TESTS=true pnpm --dir apps/backend run test:smoke
```

---

## 12. Browser Flow Test

Open `http://localhost:3000` and test:

1. Submit text.
2. Observe the processing UI.
3. Reach the passport page.
4. Expand every claim.
5. Switch supporting/opposing evidence.
6. Compare Kimi and MiniMax.
7. Copy a Gonka response ID.
8. Open the transaction explorer link.
9. run integrity verification.
10. Copy the public link and iframe badge.
11. Open the badge route directly.
12. Repeat with URL and image.
13. Repeat at a mobile viewport.

Playwright should automate a deterministic mocked version of this flow and optionally a real-backend smoke flow.

---

## 13. Production Deployment Order

Recommended order:

1. Provision production PostgreSQL.
2. Deploy and test the Base Sepolia contract.
3. Deploy backend to Railway, Render, Fly.io, or another long-running Node host.
4. Set backend environment variables.
5. Run database migrations as a release step.
6. Verify backend health and one real API call.
7. Deploy web to Vercel.
8. Set web public environment variables.
9. Add the Vercel origin to backend `WEB_ORIGINS`.
10. Re-test text, URL, image, attestation, integrity, and badge flow using deployed URLs.

Do not put the long-running verification inside a Vercel route handler; the browser should call the deployed backend directly.

---

## 14. Final Pre-Submission Checklist

- [ ] Public GitHub repository is readable.
- [ ] No `.env` or secret file is committed.
- [ ] `.env.example` files are complete.
- [ ] README contains exact setup commands.
- [ ] Both Gonka model IDs appear in code and demo results.
- [ ] Gonka response IDs appear in the UI.
- [ ] Live evidence has URLs and dates.
- [ ] Truth Score formula is documented.
- [ ] Contract is deployed to Base Sepolia.
- [ ] Contract source or ABI is available.
- [ ] Demo wallet has enough test ETH for several attestations.
- [ ] Integrity check returns valid.
- [ ] Public passport and badge URLs work without authentication.
- [ ] Mobile layout is usable.
- [ ] Demo examples are tested immediately before recording.
- [ ] Three-minute demo video shows AI, Web3, public value, and auditability.
