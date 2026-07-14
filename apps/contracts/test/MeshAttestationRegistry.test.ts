import { expect } from 'chai';
import { ethers } from 'hardhat';
import { MeshAttestationRegistry } from '../typechain-types';

describe('MeshAttestationRegistry', () => {
  const h = (value: string) => ethers.keccak256(ethers.toUtf8Bytes(value));
  const values = [
    h('passport'),
    h('input'),
    h('claims'),
    h('evidence'),
    h('kimi'),
    h('minimax'),
    h('requests'),
  ] as const;
  let registry: MeshAttestationRegistry;
  let owner: Awaited<ReturnType<typeof ethers.getSigners>>[number];
  let operator: Awaited<ReturnType<typeof ethers.getSigners>>[number];
  let stranger: Awaited<ReturnType<typeof ethers.getSigners>>[number];

  beforeEach(async () => {
    [owner, operator, stranger] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('MeshAttestationRegistry');
    registry = await factory.deploy(owner.address);
    await registry.waitForDeployment();
  });

  it('sets deployment ownership', async () => {
    expect(await registry.owner()).to.equal(owner.address);
    expect(await registry.exists(values[0])).to.equal(false);
  });

  it('allows owner and authorized operators and emits exact values', async () => {
    await expect(registry.setOperator(operator.address, true))
      .to.emit(registry, 'OperatorUpdated')
      .withArgs(operator.address, true);
    const tx = registry.connect(operator).attestPassport(...values, 72, 1);
    await expect(tx)
      .to.emit(registry, 'PassportAttested')
      .withArgs(values[0], values[2], values[3], 72, 1, operator.address, await timestampOf(tx));
    const stored = await registry.getAttestation(values[0]);
    expect(stored.inputHash).to.equal(values[1]);
    expect(stored.claimsRoot).to.equal(values[2]);
    expect(stored.evidenceRoot).to.equal(values[3]);
    expect(stored.kimiOutputHash).to.equal(values[4]);
    expect(stored.minimaxOutputHash).to.equal(values[5]);
    expect(stored.requestIdsHash).to.equal(values[6]);
    expect(stored.truthScore).to.equal(72);
    expect(stored.verificationVersion).to.equal(1);
    expect(stored.attestor).to.equal(operator.address);
  });

  it('revokes operators', async () => {
    await registry.setOperator(operator.address, true);
    await registry.setOperator(operator.address, false);
    await expect(registry.connect(operator).attestPassport(...values, 50, 1))
      .to.be.revertedWithCustomError(registry, 'Unauthorized')
      .withArgs(operator.address);
  });

  it('rejects unauthorized, duplicate, invalid score, zero owner/operator/hash and missing reads', async () => {
    await expect(
      registry.connect(stranger).attestPassport(...values, 50, 1),
    ).to.be.revertedWithCustomError(registry, 'Unauthorized');
    await expect(registry.attestPassport(...values, 101, 1))
      .to.be.revertedWithCustomError(registry, 'InvalidTruthScore')
      .withArgs(101);
    await registry.attestPassport(...values, 50, 1);
    await expect(registry.attestPassport(...values, 50, 1)).to.be.revertedWithCustomError(
      registry,
      'AlreadyAttested',
    );
    await expect(registry.getAttestation(h('missing'))).to.be.revertedWithCustomError(
      registry,
      'AttestationNotFound',
    );
    await expect(registry.setOperator(ethers.ZeroAddress, true)).to.be.revertedWithCustomError(
      registry,
      'ZeroAddress',
    );
    const factory = await ethers.getContractFactory('MeshAttestationRegistry');
    await expect(factory.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      registry,
      'OwnableInvalidOwner',
    );
    await expect(
      registry.attestPassport(
        ethers.ZeroHash,
        values[1],
        values[2],
        values[3],
        values[4],
        values[5],
        values[6],
        50,
        1,
      ),
    ).to.be.revertedWithCustomError(registry, 'InvalidPassportHash');
  });
});

async function timestampOf(txPromise: Promise<unknown>): Promise<bigint> {
  const tx = (await txPromise) as { wait(): Promise<{ blockNumber: number } | null> };
  const receipt = await tx.wait();
  if (!receipt) throw new Error('missing receipt');
  const block = await ethers.provider.getBlock(receipt.blockNumber);
  if (!block) throw new Error('missing block');
  return BigInt(block.timestamp);
}
