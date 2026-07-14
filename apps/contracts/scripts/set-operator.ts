import { ethers } from 'hardhat';

async function main(): Promise<void> {
  const address = process.env.MESH_CONTRACT_ADDRESS;
  const operator = process.env.OPERATOR_ADDRESS;
  if (!address || !operator)
    throw new Error('MESH_CONTRACT_ADDRESS and OPERATOR_ADDRESS are required');
  const registry = await ethers.getContractAt('MeshAttestationRegistry', address);
  const tx = await registry.setOperator(operator, process.env.OPERATOR_ALLOWED !== 'false');
  console.log(`transaction=${tx.hash}`);
  await tx.wait();
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
