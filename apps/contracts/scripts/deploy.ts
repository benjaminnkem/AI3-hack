import { mkdir, writeFile } from 'node:fs/promises';
import { ethers, network } from 'hardhat';

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const owner = process.env.INITIAL_OWNER_ADDRESS || deployer.address;
  const factory = await ethers.getContractFactory('MeshAttestationRegistry');
  const registry = await factory.deploy(owner);
  const deployTx = registry.deploymentTransaction();
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const operator = process.env.INITIAL_OPERATOR_ADDRESS;
  const operatorPending = !!operator && owner.toLowerCase() !== deployer.address.toLowerCase();
  if (operator && !operatorPending) await (await registry.setOperator(operator, true)).wait();
  const output = {
    network: network.name,
    chainId,
    address,
    deployTx: deployTx?.hash ?? null,
    deployer: deployer.address,
    owner,
    operator: operator || null,
    operatorPending,
    deployedAt: new Date().toISOString(),
  };
  await mkdir('deployments', { recursive: true });
  await writeFile(`deployments/${chainId}.json`, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
