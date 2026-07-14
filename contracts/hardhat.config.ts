import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import { config as dotenv } from 'dotenv';

dotenv();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    // Configure your target chain here; values come from the root .env.
    testnet: {
      url: process.env.CHAIN_RPC_URL ?? '',
      accounts: process.env.CHAIN_PRIVATE_KEY ? [process.env.CHAIN_PRIVATE_KEY] : [],
    },
  },
};

export default config;
