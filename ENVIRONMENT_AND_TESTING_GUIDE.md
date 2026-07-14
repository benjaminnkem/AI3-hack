# Mesh environment and testing guide

This is the beginner-friendly setup guide for the current repository. The project uses Ethereum Sepolia for contract attestations. Ethereum’s own documentation describes Sepolia as the recommended public testnet for application development and lists supported faucets: <https://ethereum.org/developers/docs/networks/>.

## 1. What you are setting up

Mesh has two services that need environment files:

1. `apps/api/.env` controls the backend, PostgreSQL, Gonka, Tavily, file storage, and blockchain read/write access.
2. `apps/contracts/.env` controls contract compilation, deployment, operator setup, and optional Etherscan verification.

The frontend is not part of this backend/contract task. Do not put backend secrets in any `NEXT_PUBLIC_*` variable.

There are three different blockchain values to understand:

- Wallet address: public identifier such as `0x123...`. It is safe to use in configuration.
- Private key: secret that signs transactions. Never commit it or send it to anyone.
- Contract address: public address returned after deploying `MeshAttestationRegistry`.

For the simplest demo, use one brand-new Ethereum Sepolia-only wallet as deployer, owner, and attestor. Do not use a wallet containing real ETH.

## 2. Install prerequisites

Install Node.js 20 or newer, pnpm 9, Git, PostgreSQL/Docker, and a wallet such as MetaMask or Coinbase Wallet.

```bash
node --version
corepack enable
pnpm --version
docker --version
docker compose version
```

Install dependencies from the repository root:

```bash
pnpm install --frozen-lockfile
```

## 3. Create a test wallet

In MetaMask or Coinbase Wallet:

1. Create a new account named `Mesh Ethereum Sepolia`.
2. Copy its public address.
3. Open the account security/details menu and export the private key.
4. Store the private key in a password manager.

Never use the recovery phrase as `DEPLOYER_PRIVATE_KEY`. Never put the private key in a screenshot, Git commit, issue, or chat message.

Ethereum Sepolia network details:

```text
Network name: Ethereum Sepolia
Chain ID: 11155111
Currency: Sepolia ETH
RPC: https://rpc.sepolia.org
Explorer: https://sepolia.etherscan.io
```

## 4. Get test ETH

Use one of the Sepolia faucets listed by Ethereum:

- Alchemy Sepolia faucet
- Chainstack Sepolia faucet
- Infura Sepolia faucet
- QuickNode Sepolia faucet
- PoW faucet

The official list is at <https://ethereum.org/developers/docs/networks/>. Paste your public wallet address, select Ethereum Sepolia, and request test ETH. Test ETH has no real value, but the wallet needs it to deploy and call the registry.

## 5. Create the environment files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/contracts/.env.example apps/contracts/.env
```

Do not commit either `.env` file.

## 6. Contract environment: `apps/contracts/.env`

Start with this minimal configuration:

```dotenv
ETHEREUM_SEPOLIA_RPC_URL=https://rpc.sepolia.org
DEPLOYER_PRIVATE_KEY=0xYOUR_TEST_WALLET_PRIVATE_KEY
INITIAL_OWNER_ADDRESS=
INITIAL_OPERATOR_ADDRESS=
ETHERSCAN_API_KEY=
MESH_CONTRACT_ADDRESS=
OPERATOR_ADDRESS=
OPERATOR_ALLOWED=true
```

### Contract variables explained

| Variable                   | Meaning                                                      | What to enter                                                   |
| -------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `ETHEREUM_SEPOLIA_RPC_URL` | URL used by Hardhat to talk to Ethereum Sepolia              | Keep the public default, or use an Alchemy/Infura/QuickNode URL |
| `DEPLOYER_PRIVATE_KEY`     | Secret key that signs the deployment transaction             | Your new test wallet private key                                |
| `INITIAL_OWNER_ADDRESS`    | Account that owns the registry                               | Leave blank; the deployer becomes owner                         |
| `INITIAL_OPERATOR_ADDRESS` | Optional account authorized to attest                        | Leave blank for the simplest setup                              |
| `ETHERSCAN_API_KEY`        | Optional key for publishing Solidity source                  | Leave blank until you want verification                         |
| `MESH_CONTRACT_ADDRESS`    | Existing deployed registry address                           | Leave blank before deployment                                   |
| `OPERATOR_ADDRESS`         | Operator changed by the operator script                      | Leave blank unless adding a second wallet                       |
| `OPERATOR_ALLOWED`         | Whether the operator script enables or disables the operator | Keep `true` when enabling                                       |

## 7. Deploy the registry

Confirm the wallet has Sepolia ETH, then run:

```bash
pnpm --filter @mesh/contracts build
pnpm --filter @mesh/contracts test
pnpm --filter @mesh/contracts deploy:sepolia
```

Deployment writes a record to:

```text
apps/contracts/deployments/11155111.json
```

Open that file and copy the `address` field. That is the contract address, not the deployment transaction hash.

Optional source verification:

```bash
pnpm --filter @mesh/contracts exec hardhat verify \
  --network sepolia \
  0xYOUR_CONTRACT_ADDRESS \
  0xYOUR_OWNER_ADDRESS
```

## 8. Backend environment: `apps/api/.env`

The backend can run without blockchain credentials while you develop the AI pipeline:

```dotenv
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
WEB_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://mesh:mesh@localhost:5432/mesh

GONKA_BASE_URL=https://api.gonkarouter.io
GONKA_API_KEY=
GONKA_KIMI_MODEL=moonshotai/Kimi-K2.6
GONKA_MINIMAX_MODEL=MiniMaxAI/MiniMax-M2.7
GONKA_MAX_TOKENS=4096
GONKA_TIMEOUT_MS=120000
GONKA_MAX_RETRIES=2
GONKA_RETRY_BASE_MS=30000

TAVILY_API_KEY=
TAVILY_SEARCH_DEPTH=advanced
TAVILY_MAX_RESULTS_PER_CLAIM=5

STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
MAX_IMAGE_BYTES=5242880
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ATTESTATION_ENABLED=false
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

### Backend variables explained

#### Runtime and database

| Variable       | Meaning                                         |
| -------------- | ----------------------------------------------- |
| `NODE_ENV`     | `development`, `test`, or `production`          |
| `PORT`         | HTTP port for the API                           |
| `API_PREFIX`   | Route prefix; normally `api/v1`                 |
| `WEB_ORIGINS`  | Comma-separated browser origins allowed by CORS |
| `DATABASE_URL` | PostgreSQL connection string                    |

#### Gonka Router

| Variable              | Meaning                                                     |
| --------------------- | ----------------------------------------------------------- |
| `GONKA_BASE_URL`      | Official Gonka API root; keep `https://api.gonkarouter.io`  |
| `GONKA_API_KEY`       | Secret API key from the Gonka Router dashboard              |
| `GONKA_KIMI_MODEL`    | Exact Kimi model ID; do not shorten it                      |
| `GONKA_MINIMAX_MODEL` | Exact MiniMax model ID                                      |
| `GONKA_MAX_TOKENS`    | Maximum output tokens; keep at least `1024`, default `4096` |
| `GONKA_TIMEOUT_MS`    | Maximum wait for one model call                             |
| `GONKA_MAX_RETRIES`   | Number of transient `429`/`5xx` retries                     |
| `GONKA_RETRY_BASE_MS` | Initial retry delay; `30000` matches Gonka guidance         |

Create `GONKA_API_KEY` at <https://gonkarouter.io/>. It is backend-only.

#### Tavily

| Variable                       | Meaning                                     |
| ------------------------------ | ------------------------------------------- |
| `TAVILY_API_KEY`               | Secret key from Tavily                      |
| `TAVILY_SEARCH_DEPTH`          | `advanced` or `basic` evidence search       |
| `TAVILY_MAX_RESULTS_PER_CLAIM` | Maximum evidence sources per claim, up to 5 |

Create `TAVILY_API_KEY` at <https://app.tavily.com/>. Tavily retrieves evidence; it is not used as an LLM provider.

#### Storage

| Variable                | Meaning                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `STORAGE_DRIVER`        | `local` for development, `cloudinary` for deployed image storage |
| `UPLOAD_DIR`            | Local image directory                                            |
| `MAX_IMAGE_BYTES`       | Maximum upload size; default is 5 MiB                            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name                                          |
| `CLOUDINARY_API_KEY`    | Cloudinary public API key                                        |
| `CLOUDINARY_API_SECRET` | Cloudinary secret                                                |

Leave Cloudinary fields empty when `STORAGE_DRIVER=local`.

#### Ethereum Sepolia attestation

| Variable                    | Meaning                                      | Development value                          |
| --------------------------- | -------------------------------------------- | ------------------------------------------ |
| `ATTESTATION_ENABLED`       | Turns on blockchain writes                   | `false` until deployment; `true` afterward |
| `ATTESTATION_NETWORK`       | Human-readable network label                 | `ethereum-sepolia`                         |
| `ATTESTATION_CHAIN_ID`      | Safety check preventing wrong-network writes | `11155111`                                 |
| `ATTESTATION_RPC_URL`       | Backend RPC endpoint                         | `https://rpc.sepolia.org`                  |
| `ATTESTATION_EXPLORER_URL`  | Explorer used to build transaction links     | `https://sepolia.etherscan.io`             |
| `MESH_CONTRACT_ADDRESS`     | Registry address from deployment JSON        | Empty until deployment                     |
| `ATTESTOR_PRIVATE_KEY`      | Secret key signing attestation transactions  | Same test wallet key for a simple demo     |
| `ATTESTATION_CONFIRMATIONS` | Blocks to wait before readback               | `1`                                        |

`ATTESTATION_ENABLED=false` means Mesh still creates complete off-chain passports but does not spend test ETH or call the contract. Set it to `true` only after the registry is deployed and the attestor wallet is funded.

After deployment, update only these values:

```dotenv
ATTESTATION_ENABLED=true
MESH_CONTRACT_ADDRESS=0xTHE_ADDRESS_FROM_11155111_JSON
ATTESTOR_PRIVATE_KEY=0xTHE_TEST_WALLET_PRIVATE_KEY
```

The deployer wallet is automatically the owner. Because owners can attest, no operator setup is needed for the one-wallet demo.

## 9. PostgreSQL and migrations

Start PostgreSQL:

```bash
docker compose up -d postgres
docker compose ps
```

Run migrations:

```bash
pnpm --filter @mesh/api migration:run
```

The migration creates verification, claim, evidence, model response, passport, and attestation tables. The Ethereum migration also updates any legacy Base metadata to `ethereum-sepolia` / `11155111`.

## 10. Start and test Mesh

```bash
pnpm --filter @mesh/api dev
```

Swagger is available at `http://localhost:4000/docs`.

Run validation:

```bash
pnpm --filter @mesh/api lint
pnpm --filter @mesh/api typecheck
pnpm --filter @mesh/api test:unit
pnpm --filter @mesh/api test:e2e
pnpm --filter @mesh/api build
pnpm --filter @mesh/contracts build
pnpm --filter @mesh/contracts test
```

Check blockchain configuration:

```bash
curl http://localhost:4000/api/v1/health
```

When enabled, health should report Ethereum Sepolia chain ID `11155111` and contract bytecode present.

## 11. Common mistakes

- Using `BASE_*` variables: these are obsolete. Use `ATTESTATION_*` in the backend and `ETHEREUM_SEPOLIA_RPC_URL` in the contract app.
- Using the recovery phrase instead of a private key.
- Forgetting to fund the wallet with Ethereum Sepolia ETH.
- Copying the deployment transaction hash instead of the contract `address`.
- Setting `ATTESTATION_ENABLED=true` before filling the contract address and attestor key.
- Using Ethereum Mainnet RPC or real ETH.
- Putting `GONKA_API_KEY`, `TAVILY_API_KEY`, or private keys in frontend variables.
- Changing `ATTESTATION_CHAIN_ID` away from `11155111`; the backend intentionally rejects other values.
