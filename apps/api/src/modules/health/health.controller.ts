import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly config: ConfigService,
    private readonly blockchain: BlockchainService,
  ) {}
  @Get() async health() {
    let database = false;
    try {
      await this.db.query('SELECT 1');
      database = true;
    } catch {
      database = false;
    }
    const chain = await this.blockchain.health();
    return {
      status: database ? 'ok' : 'degraded',
      api: true,
      database,
      gonkaConfigured: !!this.config.get('GONKA_API_KEY'),
      tavilyConfigured: !!this.config.get('TAVILY_API_KEY'),
      storageDriver: this.config.get('STORAGE_DRIVER'),
      attestationEnabled: this.blockchain.enabled,
      attestationNetwork: this.config.get('ATTESTATION_NETWORK'),
      attestationChainId: this.config.get('ATTESTATION_CHAIN_ID'),
      rpcReachable: chain.rpc,
      contractCode: chain.contractCode,
    };
  }
}
