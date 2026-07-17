import { z } from 'zod';

const bool = z.enum(['true', 'false']).transform((value) => value === 'true');
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    API_PREFIX: z.string().default('api/v1'),
    WEB_ORIGINS: z.string().default('http://localhost:3000'),
    DATABASE_URL: z.string().min(1),
    GONKA_BASE_URL: z.string().url().default('https://api.gonkarouter.io'),
    GONKA_API_KEY: z.string().optional(),
    GONKA_KIMI_MODEL: z.literal('moonshotai/Kimi-K2.6').default('moonshotai/Kimi-K2.6'),
    GONKA_KIMI_FALLBACK_MODEL: z
      .literal('MiniMaxAI/MiniMax-M2.7')
      .default('MiniMaxAI/MiniMax-M2.7'),
    GONKA_MINIMAX_MODEL: z.literal('MiniMaxAI/MiniMax-M2.7').default('MiniMaxAI/MiniMax-M2.7'),
    GONKA_MAX_TOKENS: z.coerce.number().int().min(1024).default(4096),
    GONKA_VISUAL_MAX_TOKENS: z.coerce.number().int().min(1024).default(1536),
    GONKA_CLAIM_MAX_TOKENS: z.coerce.number().int().min(1024).default(1536),
    GONKA_INVESTIGATOR_MAX_TOKENS: z.coerce.number().int().min(1024).default(3072),
    GONKA_ADVERSARIAL_MAX_TOKENS: z.coerce.number().int().min(1024).default(2048),
    GONKA_NARRATIVE_MAX_TOKENS: z.coerce.number().int().min(1024).default(1536),
    GONKA_TIMEOUT_MS: z.coerce.number().int().min(1000).default(120000),
    GONKA_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(1),
    GONKA_RETRY_BASE_MS: z.coerce.number().int().min(1000).default(2000),
    TAVILY_API_KEY: z.string().optional(),
    TAVILY_SEARCH_DEPTH: z.enum(['ultra-fast', 'fast', 'basic', 'advanced']).default('fast'),
    TAVILY_EXTRACT_DEPTH: z.enum(['basic', 'advanced']).default('basic'),
    TAVILY_MAX_RESULTS_PER_CLAIM: z.coerce.number().int().min(1).max(5).default(4),
    TAVILY_MAX_QUERIES_PER_CLAIM: z.coerce.number().int().min(1).max(4).default(2),
    TAVILY_SEARCH_CONCURRENCY: z.coerce.number().int().min(1).max(10).default(4),
    STORAGE_DRIVER: z.enum(['local', 'cloudinary']).default('local'),
    UPLOAD_DIR: z.string().default('./uploads'),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    MAX_IMAGE_BYTES: z.coerce.number().int().positive().default(5242880),
    ATTESTATION_ENABLED: bool.default('false'),
    ATTESTATION_NETWORK: z.literal('ethereum-sepolia').default('ethereum-sepolia'),
    ATTESTATION_CHAIN_ID: z.coerce
      .number()
      .int()
      .refine((value) => value === 11155111, 'must be Ethereum Sepolia chain ID 11155111')
      .default(11155111),
    ATTESTATION_RPC_URL: z.string().url().default('https://rpc.sepolia.org'),
    ATTESTATION_EXPLORER_URL: z.string().url().default('https://sepolia.etherscan.io'),
    MESH_CONTRACT_ADDRESS: z.string().optional(),
    ATTESTOR_PRIVATE_KEY: z.string().optional(),
    ATTESTATION_CONFIRMATIONS: z.coerce.number().int().min(1).default(1),
    PASSPORT_REUSE_WINDOW_MINUTES: z.coerce.number().int().min(0).default(60),
    RATE_LIMIT_TTL_MS: z.coerce.number().int().positive().default(60000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    SWAGGER_ENABLED: bool.default('true'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'test' && !env.GONKA_API_KEY)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GONKA_API_KEY'],
        message: 'required outside tests',
      });
    if (env.NODE_ENV !== 'test' && !env.TAVILY_API_KEY)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['TAVILY_API_KEY'],
        message: 'required outside tests',
      });
    if (
      env.STORAGE_DRIVER === 'cloudinary' &&
      (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET)
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['STORAGE_DRIVER'],
        message: 'Cloudinary credentials are required',
      });
    if (env.ATTESTATION_ENABLED && (!env.MESH_CONTRACT_ADDRESS || !env.ATTESTOR_PRIVATE_KEY))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ATTESTATION_ENABLED'],
        message: 'contract address and attestor key are required',
      });
  });

export type Environment = z.infer<typeof envSchema>;
export function validateEnvironment(input: Record<string, unknown>): Environment {
  return envSchema.parse(input);
}
