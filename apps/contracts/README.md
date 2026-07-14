# Mesh Attestation Registry

`MeshAttestationRegistry` stores only compact Evidence Passport hashes and metadata. It has owner/operator authorization, one attestation per passport hash, custom errors, exact readback, and no token, payments, proxy, NFT, or wallet UI.

New to Web3? Follow the [beginner environment and testing guide](../../ENVIRONMENT_AND_TESTING_GUIDE.md) for wallet, faucet, and environment setup.

## Local

```bash
pnpm --filter @mesh/contracts build
pnpm --filter @mesh/contracts test
pnpm --filter @mesh/contracts exec hardhat node
# second terminal
pnpm --filter @mesh/contracts deploy:local
```

The build exports the generated ABI to `apps/api/src/modules/blockchain/abi/MeshAttestationRegistry.json`.

## Ethereum Sepolia

Create a dedicated testnet wallet, fund it using an [Ethereum Sepolia faucet](https://sepolia-faucet.pk910.de/), then:

```bash
cp apps/contracts/.env.example apps/contracts/.env
pnpm --filter @mesh/contracts deploy:sepolia
```

Deployment output is written to `apps/contracts/deployments/11155111.json` with address, chain ID, deploy transaction and timestamp. Copy its address to backend `MESH_CONTRACT_ADDRESS`. If the backend signer differs from the owner, set `OPERATOR_ADDRESS`, then run:

```bash
MESH_CONTRACT_ADDRESS=0x... OPERATOR_ADDRESS=0x... pnpm --filter @mesh/contracts operator:sepolia
```

Optional Etherscan source verification:

```bash
pnpm --filter @mesh/contracts exec hardhat verify --network sepolia 0xCONTRACT 0xINITIAL_OWNER
```

`DEPLOYER_PRIVATE_KEY` and `ETHERSCAN_API_KEY` are secrets. `ETHEREUM_SEPOLIA_RPC_URL`, owner/operator addresses, and the deployed contract address are public. The public RPC default is suitable for demos; a provider URL is more reliable. Never fund the deployer with mainnet assets.
