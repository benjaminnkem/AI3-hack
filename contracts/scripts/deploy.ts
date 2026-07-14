import { ethers } from 'hardhat';

async function main(): Promise<void> {
  const Registry = await ethers.getContractFactory('MeshRegistry');
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  // eslint-disable-next-line no-console
  console.log(`MeshRegistry deployed to: ${address}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
