import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
async function main() {
  const root = resolve(__dirname, '..');
  const artifact = JSON.parse(
    await readFile(
      resolve(root, 'artifacts/contracts/MeshAttestationRegistry.sol/MeshAttestationRegistry.json'),
      'utf8',
    ),
  ) as { abi: unknown };
  const target = resolve(root, '../api/src/modules/blockchain/abi/MeshAttestationRegistry.json');
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, `${JSON.stringify(artifact.abi, null, 2)}\n`);
  console.log(`ABI exported to ${target}`);
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
