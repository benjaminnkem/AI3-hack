import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ProofMeshRegistry } from '../typechain-types';

describe('ProofMeshRegistry', () => {
  let registry: ProofMeshRegistry;
  const hash = ethers.keccak256(ethers.toUtf8Bytes('passport-1'));

  beforeEach(async () => {
    const Factory = await ethers.getContractFactory('ProofMeshRegistry');
    registry = (await Factory.deploy()) as unknown as ProofMeshRegistry;
    await registry.waitForDeployment();
  });

  it('records an attestation and increments the total', async () => {
    await registry.attest(hash, 72, 100, 'gonka_req_1');
    expect(await registry.totalAttestations()).to.equal(1n);
    expect(await registry.isAttested(hash)).to.equal(true);
  });

  it('returns stored attestation data', async () => {
    await registry.attest(hash, 72, 100, 'gonka_req_1');
    const [score, version, , requestId] = await registry.getAttestation(hash);
    expect(score).to.equal(72);
    expect(version).to.equal(100);
    expect(requestId).to.equal('gonka_req_1');
  });

  it('rejects a duplicate attestation', async () => {
    await registry.attest(hash, 72, 100, 'r');
    await expect(registry.attest(hash, 80, 100, 'r')).to.be.revertedWithCustomError(
      registry,
      'AlreadyAttested',
    );
  });

  it('rejects an out-of-range truth score', async () => {
    await expect(registry.attest(hash, 200, 100, 'r')).to.be.revertedWithCustomError(
      registry,
      'InvalidTruthScore',
    );
  });

  it('reverts reading an unknown passport', async () => {
    await expect(registry.getAttestation(hash)).to.be.revertedWithCustomError(
      registry,
      'NotFound',
    );
  });
});
