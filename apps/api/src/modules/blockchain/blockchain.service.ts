import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import abi from './abi/MeshAttestationRegistry.json';
export interface IntegrityValues {
  passportHash: string;
  inputHash: string;
  claimsRoot: string;
  evidenceRoot: string;
  kimiOutputHash: string;
  minimaxOutputHash: string;
  requestIdsHash: string;
  truthScore: number;
  verificationVersion: number;
}
export interface ChainAttestation {
  inputHash: string;
  claimsRoot: string;
  evidenceRoot: string;
  kimiOutputHash: string;
  minimaxOutputHash: string;
  requestIdsHash: string;
  truthScore: number;
  verificationVersion: number;
  timestamp: number;
  attestor: string;
}
export interface AttestationReceipt {
  transactionHash: string | null;
  blockNumber: number | null;
  chainId: number;
  contractAddress: string;
  attestor: string | null;
  existing: boolean;
}
@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly provider: JsonRpcProvider;
  private readonly contract: Contract | null;
  readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const chainId = config.get<number>('ATTESTATION_CHAIN_ID', 11155111);
    this.provider = new JsonRpcProvider(
      config.get('ATTESTATION_RPC_URL', 'https://rpc.sepolia.org'),
      chainId,
      { staticNetwork: true },
    );
    this.enabled = config.get<boolean>('ATTESTATION_ENABLED', false);
    const address = config.get<string>('MESH_CONTRACT_ADDRESS');
    const key = config.get<string>('ATTESTOR_PRIVATE_KEY');
    this.contract =
      this.enabled && address && key
        ? new Contract(address, abi, new Wallet(key, this.provider))
        : null;
  }

  async attest(values: IntegrityValues): Promise<AttestationReceipt | null> {
    if (!this.enabled || !this.contract) return null;

    if ((await this.contract.exists(values.passportHash)) as boolean) {
      const read = await this.read(values.passportHash);
      return {
        transactionHash: null,
        blockNumber: null,
        chainId: this.config.get<number>('ATTESTATION_CHAIN_ID', 11155111),
        contractAddress: String(await this.contract.getAddress()),
        attestor: read?.attestor ?? null,
        existing: true,
      };
    }

    const tx = await this.contract.attestPassport(
      values.passportHash,
      values.inputHash,
      values.claimsRoot,
      values.evidenceRoot,
      values.kimiOutputHash,
      values.minimaxOutputHash,
      values.requestIdsHash,
      values.truthScore,
      values.verificationVersion,
    );

    const receipt = await tx.wait(this.config.get('ATTESTATION_CONFIRMATIONS', 1));
    if (!receipt) throw new Error('Attestation transaction was not mined');

    const readback = await this.read(values.passportHash);
    if (!readback || !this.matches(values, readback))
      throw new Error('Contract readback does not match passport');

    this.logger.log(
      JSON.stringify({
        event: 'attestation.confirmed',
        passportHash: values.passportHash,
        transactionHash: receipt.hash,
      }),
    );
    return {
      transactionHash: receipt.hash,
      blockNumber: Number(receipt.blockNumber),
      chainId: this.config.get<number>('ATTESTATION_CHAIN_ID', 11155111),
      contractAddress: String(await this.contract.getAddress()),
      attestor: readback.attestor,
      existing: false,
    };
  }

  async read(passportHash: string): Promise<ChainAttestation | null> {
    if (!this.contract || !((await this.contract.exists(passportHash)) as boolean)) return null;
    const a = (await this.contract.getAttestation(passportHash)) as {
      inputHash: string;
      claimsRoot: string;
      evidenceRoot: string;
      kimiOutputHash: string;
      minimaxOutputHash: string;
      requestIdsHash: string;
      truthScore: bigint;
      verificationVersion: bigint;
      timestamp: bigint;
      attestor: string;
    };
    // ethers v6 Result objects expose named tuple fields, but spreading the
    // result only copies numeric indexes. Map each field explicitly so
    // readback validation compares the actual on-chain values.
    return {
      inputHash: a.inputHash,
      claimsRoot: a.claimsRoot,
      evidenceRoot: a.evidenceRoot,
      kimiOutputHash: a.kimiOutputHash,
      minimaxOutputHash: a.minimaxOutputHash,
      requestIdsHash: a.requestIdsHash,
      truthScore: Number(a.truthScore),
      verificationVersion: Number(a.verificationVersion),
      timestamp: Number(a.timestamp),
      attestor: a.attestor,
    };
  }
  async health(): Promise<{ rpc: boolean; contractCode: boolean }> {
    try {
      await this.provider.getBlockNumber();
      const address = this.config.get<string>('MESH_CONTRACT_ADDRESS');
      return {
        rpc: true,
        contractCode:
          !this.enabled || (!!address && (await this.provider.getCode(address)) !== '0x'),
      };
    } catch {
      return { rpc: false, contractCode: false };
    }
  }
  private matches(a: IntegrityValues, b: ChainAttestation): boolean {
    return (
      [
        'inputHash',
        'claimsRoot',
        'evidenceRoot',
        'kimiOutputHash',
        'minimaxOutputHash',
        'requestIdsHash',
      ].every((key) => a[key as keyof IntegrityValues] === b[key as keyof ChainAttestation]) &&
      a.truthScore === b.truthScore &&
      a.verificationVersion === b.verificationVersion
    );
  }
}
