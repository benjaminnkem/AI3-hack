import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, JsonRpcProvider, Wallet, getBytes } from 'ethers';

export interface AttestationReceipt {
  transactionHash: string;
  blockNumber: number;
  chainId: number;
}

/**
 * ABI for the ProofMesh attestation registry. Kept minimal — only what the
 * backend needs to write and read attestations.
 */
const REGISTRY_ABI = [
  'function attest(bytes32 passportHash, uint16 truthScore, uint16 verificationVersion, string requestId) external returns (uint256)',
  'function getAttestation(bytes32 passportHash) external view returns (uint16 truthScore, uint16 verificationVersion, uint256 timestamp, string requestId)',
  'event PassportAttested(bytes32 indexed passportHash, uint16 truthScore, uint256 timestamp)',
];

/**
 * Writes passport hashes to the on-chain registry via ethers.js.
 *
 * If chain credentials are not configured, attestation is SKIPPED (returns
 * null) rather than faked — the verification still completes and the passport
 * is still hashed; it simply won't carry a blockchain receipt. This keeps the
 * demo runnable without a funded key while remaining honest about state.
 */
@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly contract: Contract | null;
  private readonly configuredChainId: number;

  constructor(private readonly config: ConfigService) {
    const rpcUrl = this.config.get<string>('CHAIN_RPC_URL');
    const privateKey = this.config.get<string>('CHAIN_PRIVATE_KEY');
    const contractAddress = this.config.get<string>('CONTRACT_ADDRESS');
    this.configuredChainId = Number(this.config.get('CHAIN_ID', 0));

    if (rpcUrl && privateKey && contractAddress) {
      const provider = new JsonRpcProvider(rpcUrl);
      const wallet = new Wallet(privateKey, provider);
      this.contract = new Contract(contractAddress, REGISTRY_ABI, wallet);
    } else {
      this.contract = null;
      this.logger.warn('Chain credentials missing — attestations will be skipped.');
    }
  }

  get enabled(): boolean {
    return this.contract !== null;
  }

  async attest(
    passportHash: string,
    truthScore: number,
    version: number,
    requestId: string,
  ): Promise<AttestationReceipt | null> {
    if (!this.contract) return null;

    // bytes32 must be exactly 32 bytes — getBytes validates the 0x-prefixed hash.
    getBytes(passportHash);

    const tx = await this.contract.attest(
      passportHash,
      Math.round(truthScore),
      version,
      requestId,
    );
    const receipt = await tx.wait();
    this.logger.log(`Attested ${passportHash} in tx ${receipt.hash}`);

    return {
      transactionHash: receipt.hash,
      blockNumber: Number(receipt.blockNumber),
      chainId: this.configuredChainId,
    };
  }
}
