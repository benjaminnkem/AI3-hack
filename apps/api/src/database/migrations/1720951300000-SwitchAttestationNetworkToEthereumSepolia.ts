import { MigrationInterface, QueryRunner } from 'typeorm';

export class SwitchAttestationNetworkToEthereumSepolia1720951300000 implements MigrationInterface {
  name = 'SwitchAttestationNetworkToEthereumSepolia1720951300000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attestations" ALTER COLUMN "network" SET DEFAULT 'ethereum-sepolia'`,
    );
    await queryRunner.query(
      `ALTER TABLE "attestations" ALTER COLUMN "chainId" SET DEFAULT 11155111`,
    );
    await queryRunner.query(
      `UPDATE "attestations" SET "network" = 'ethereum-sepolia', "chainId" = 11155111 WHERE "network" = 'base-sepolia' OR "chainId" = 84532`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "attestations" SET "network" = 'base-sepolia', "chainId" = 84532 WHERE "network" = 'ethereum-sepolia' OR "chainId" = 11155111`,
    );
    await queryRunner.query(
      `ALTER TABLE "attestations" ALTER COLUMN "network" SET DEFAULT 'base-sepolia'`,
    );
    await queryRunner.query(`ALTER TABLE "attestations" ALTER COLUMN "chainId" SET DEFAULT 84532`);
  }
}
