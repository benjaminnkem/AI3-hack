'use client';

import { motion } from 'framer-motion';
import { Passport } from '@/lib/types';
import { TruthScoreGauge } from './TruthScoreGauge';
import { ConsensusCard } from './ConsensusCard';
import { ClaimCard } from './ClaimCard';
import { BlockchainCard } from './BlockchainCard';

/** Full passport render — reused by the verify result and the public page. */
export function PassportView({ passport }: { passport: Passport }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-6 lg:grid-cols-3"
    >
      <div className="card flex flex-col items-center justify-center gap-4 p-8 lg:col-span-1">
        <TruthScoreGauge score={passport.truthScore} />
        <p className="text-center text-sm text-muted">{passport.summary}</p>
      </div>

      <div className="lg:col-span-2">
        <ConsensusCard consensus={passport.consensus} models={passport.modelResponses} />
      </div>

      <div className="space-y-3 lg:col-span-2">
        <h3 className="text-lg font-semibold">Extracted Claims</h3>
        {passport.claims.map((c, i) => (
          <ClaimCard key={i} claim={c} />
        ))}
      </div>

      <div className="lg:col-span-1">
        <BlockchainCard attestation={passport.attestation} passportHash={passport.passportHash} />
      </div>
    </motion.div>
  );
}
