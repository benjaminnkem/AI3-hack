import { MigrationInterface, QueryRunner } from 'typeorm';
export class InitialMeshSchema1720951200000 implements MigrationInterface {
  name = 'InitialMeshSchema1720951200000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "verifications_inputtype_enum" AS ENUM ('TEXT','URL','IMAGE')`);
    await q.query(
      `CREATE TYPE "verifications_status_enum" AS ENUM ('PROCESSING','COMPLETED','FAILED')`,
    );
    await q.query(
      `CREATE TYPE "claims_verdict_enum" AS ENUM ('SUPPORTED','UNVERIFIED','MISLEADING','CONTRADICTED')`,
    );
    await q.query(`CREATE TYPE "evidence_direction_enum" AS ENUM ('SUPPORTS','OPPOSES','NEUTRAL')`);
    await q.query(
      `CREATE TYPE "attestations_status_enum" AS ENUM ('CONFIRMED','PENDING','FAILED','DISABLED')`,
    );
    await q.query(
      `CREATE TABLE "verifications" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"inputType" "verifications_inputtype_enum" NOT NULL,"originalText" text,"sourceUrl" text,"imageUrl" text,"normalizedContent" text NOT NULL,"inputHash" varchar(66) NOT NULL,"status" "verifications_status_enum" NOT NULL DEFAULT 'PROCESSING',"currentStage" varchar(64) NOT NULL DEFAULT 'INGESTION',"errorCode" varchar(80),"errorMessage" text,"startedAt" timestamptz NOT NULL DEFAULT now(),"completedAt" timestamptz,"createdAt" timestamptz NOT NULL DEFAULT now(),"updatedAt" timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE "claims" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"verificationId" uuid NOT NULL REFERENCES "verifications"("id") ON DELETE CASCADE,"text" text NOT NULL,"normalizedText" text NOT NULL,"context" text NOT NULL DEFAULT '',"importance" smallint NOT NULL CHECK ("importance" BETWEEN 1 AND 5),"dateSensitive" boolean NOT NULL DEFAULT false,"searchQueries" jsonb NOT NULL,"claimHash" varchar(66) NOT NULL,"truthScore" smallint NOT NULL DEFAULT 50 CHECK ("truthScore" BETWEEN 0 AND 100),"confidenceScore" smallint NOT NULL DEFAULT 0 CHECK ("confidenceScore" BETWEEN 0 AND 100),"verdict" "claims_verdict_enum" NOT NULL DEFAULT 'UNVERIFIED',"reasoningSummary" text NOT NULL DEFAULT '')`,
    );
    await q.query(
      `CREATE TABLE "evidence" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"claimId" uuid NOT NULL REFERENCES "claims"("id") ON DELETE CASCADE,"title" text NOT NULL,"url" text NOT NULL,"canonicalUrl" text NOT NULL,"domain" varchar(255) NOT NULL,"excerpt" text NOT NULL,"publishedAt" timestamptz,"retrievedAt" timestamptz NOT NULL,"direction" "evidence_direction_enum" NOT NULL DEFAULT 'NEUTRAL',"tavilyRelevanceScore" double precision NOT NULL,"sourceQualityScore" smallint NOT NULL DEFAULT 0,"contentHash" varchar(66) NOT NULL)`,
    );
    await q.query(
      `CREATE TABLE "model_responses" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"verificationId" uuid NOT NULL REFERENCES "verifications"("id") ON DELETE CASCADE,"claimId" uuid,"agentRole" varchar(40) NOT NULL,"modelId" varchar(128) NOT NULL,"gonkaResponseId" varchar(255) NOT NULL,"providerRequestId" varchar(255),"parsedOutput" jsonb NOT NULL,"rawOutput" text,"outputHash" varchar(66) NOT NULL,"inputTokens" integer NOT NULL DEFAULT 0,"outputTokens" integer NOT NULL DEFAULT 0,"latencyMs" integer NOT NULL,"retryCount" smallint NOT NULL DEFAULT 0,"createdAt" timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE "passports" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"publicId" varchar(40) NOT NULL UNIQUE,"verificationId" uuid NOT NULL UNIQUE REFERENCES "verifications"("id") ON DELETE CASCADE,"version" smallint NOT NULL,"previousPassportId" uuid,"schemaVersion" varchar(20) NOT NULL DEFAULT '1.0.0',"verdict" "claims_verdict_enum" NOT NULL,"truthScore" smallint NOT NULL,"confidenceScore" smallint NOT NULL,"summary" text NOT NULL,"disagreementSummary" jsonb NOT NULL DEFAULT '[]'::jsonb,"canonicalPayload" jsonb NOT NULL,"claimsRoot" varchar(66) NOT NULL,"evidenceRoot" varchar(66) NOT NULL,"kimiOutputHash" varchar(66) NOT NULL,"minimaxOutputHash" varchar(66) NOT NULL,"requestIdsHash" varchar(66) NOT NULL,"passportHash" varchar(66) NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `ALTER TABLE "passports" ADD CONSTRAINT "FK_passport_previous" FOREIGN KEY ("previousPassportId") REFERENCES "passports"("id") ON DELETE SET NULL`,
    );
    await q.query(
      `CREATE TABLE "attestations" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"passportId" uuid NOT NULL UNIQUE REFERENCES "passports"("id") ON DELETE CASCADE,"status" "attestations_status_enum" NOT NULL,"network" varchar(32) NOT NULL DEFAULT 'ethereum-sepolia',"chainId" integer NOT NULL DEFAULT 11155111,"contractAddress" varchar(42),"transactionHash" varchar(66),"blockNumber" bigint,"attestor" varchar(42),"errorMessage" text,"attestedAt" timestamptz,"createdAt" timestamptz NOT NULL DEFAULT now(),"updatedAt" timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE INDEX "IDX_verification_input_status_completed" ON "verifications" ("inputHash","status","completedAt")`,
    );
    await q.query(`CREATE INDEX "IDX_verification_created" ON "verifications" ("createdAt")`);
    await q.query(`CREATE INDEX "IDX_claim_verification" ON "claims" ("verificationId")`);
    await q.query(`CREATE INDEX "IDX_evidence_claim" ON "evidence" ("claimId")`);
    await q.query(`CREATE INDEX "IDX_evidence_url" ON "evidence" ("canonicalUrl")`);
    await q.query(
      `CREATE INDEX "IDX_model_verification_role" ON "model_responses" ("verificationId","agentRole")`,
    );
    await q.query(`CREATE INDEX "IDX_passport_created" ON "passports" ("createdAt")`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "attestations"`);
    await q.query(`DROP TABLE "passports"`);
    await q.query(`DROP TABLE "model_responses"`);
    await q.query(`DROP TABLE "evidence"`);
    await q.query(`DROP TABLE "claims"`);
    await q.query(`DROP TABLE "verifications"`);
    await q.query(`DROP TYPE "attestations_status_enum"`);
    await q.query(`DROP TYPE "evidence_direction_enum"`);
    await q.query(`DROP TYPE "claims_verdict_enum"`);
    await q.query(`DROP TYPE "verifications_status_enum"`);
    await q.query(`DROP TYPE "verifications_inputtype_enum"`);
  }
}
