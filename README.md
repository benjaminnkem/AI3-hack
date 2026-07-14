# ProofMesh

> Every digital claim deserves a verifiable Evidence Passport.

ProofMesh is a decentralized AI verification protocol. Submit a URL, tweet, or
text; it extracts the factual claims, cross-checks them across **independent AI
models via the Gonka Router**, builds an **Evidence Passport**, and anchors a
keccak256 hash of that passport **on-chain** for tamper-evidence.

Built for the **AI³ Growth Hackathon — Track 3 (Gonka: AI for Society)**.

---

## Why this design

Centralized fact-checkers hand you one opaque number. ProofMesh runs the same
claim through **two different LLMs (Kimi + MiniMax)** and shows you each model's
verdict *and where they disagree*. The multi-model cross-consensus required by
Track 3 becomes the headline feature, not a box-tick. Every model call carries a
**Gonka Request ID** surfaced in the passport for full auditability.

---

## Architecture

Clean Architecture, dependency injection throughout:

```
Controllers → Services → Repositories → Database
```

```
proofmesh/
├── apps/
│   ├── api/                 # NestJS backend
│   │   └── src/
│   │       ├── entities/            # TypeORM entities (7)
│   │       ├── common/filters/      # Global exception filter
│   │       ├── database/            # TypeORM data source
│   │       └── modules/
│   │           ├── gonka/           # Real Gonka Router HTTP client
│   │           ├── claim-extraction/# Claim extraction via Gonka
│   │           ├── consensus/       # ConsensusService (no hardcoding)
│   │           ├── passport/        # Canonical hashing (keccak256)
│   │           ├── blockchain/      # ethers.js attestation
│   │           └── verification/    # Orchestration + controller + DTOs
│   └── web/                 # Next.js 15 frontend (App Router)
│       └── src/
│           ├── app/                 # landing / verify / passport / history / about
│           ├── components/          # TruthScoreGauge, ConsensusCard, ...
│           └── lib/                 # api client, types, utils
└── contracts/               # Solidity + Hardhat (ProofMeshRegistry)
```

### Verification flow

```
input → resolve → extract claims → [Kimi ‖ MiniMax via Gonka]
      → consensus engine → truth score → passport → keccak256 hash
      → on-chain attestation → return passport
```

---

## Prerequisites

- Node.js ≥ 20, pnpm ≥ 9
- PostgreSQL, Redis
- A Gonka Router API key (https://gonkarouter.io) — required for real inference

## Running locally

```bash
pnpm install
cp .env.example .env        # then fill in GONKA_API_KEY at minimum

# start Postgres + Redis (or use Docker)
# backend (auto-creates tables via synchronize in dev):
pnpm --filter @proofmesh/api dev      # → http://localhost:4000  (Swagger at /docs)

# frontend:
pnpm --filter @proofmesh/web dev      # → http://localhost:3000
```

### Smart contract

```bash
pnpm --filter @proofmesh/contracts build
pnpm --filter @proofmesh/contracts test
pnpm --filter @proofmesh/contracts deploy   # deploys to CHAIN_RPC_URL
# put the deployed address in CONTRACT_ADDRESS to enable on-chain attestation
```

> Attestation is **optional**: if chain vars are unset the passport is still
> produced and hashed — it just carries no on-chain receipt. Nothing is faked.

## Tests

```bash
pnpm --filter @proofmesh/api test         # ConsensusService, PassportService
pnpm --filter @proofmesh/contracts test   # ProofMeshRegistry
```

## API

| Method | Route                  | Description                          |
|--------|------------------------|--------------------------------------|
| POST   | `/api/verify`          | Run verification, mint a passport    |
| GET    | `/api/passports/:id`   | Fetch a public passport by public id |
| GET    | `/api/verifications`   | List recent verifications            |
| GET    | `/api/history`         | History view (alias)                 |

Full Swagger docs at `/docs`.

## Environment variables

See [`.env.example`](./.env.example). The only variable strictly required for
real verification is `GONKA_API_KEY`. `DATABASE_URL` is required for persistence.

## Deploying

- **Frontend** → Vercel (set `NEXT_PUBLIC_API_URL`)
- **Backend** → Railway (set all backend vars; provision Postgres + Redis)
- **Contract** → deploy via Hardhat, set `CONTRACT_ADDRESS`

---

## Honest status notes

- The Gonka client is a **real, DI-injected HTTP client**, not a mock. It calls
  `/v1/chat/completions` (OpenAI-compatible router convention). **Confirm the
  exact endpoint path and payload shape against the current gonkarouter.io docs**
  before your live demo — that is the one integration point to verify first.
- Image input is wired through the flow but returns `501` until a Gonka
  vision model route is confirmed (marked `TODO` in `input-resolver.service.ts`),
  rather than fabricating OCR output.
# AI3-hack
