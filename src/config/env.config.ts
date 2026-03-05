import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  GITHUB_API_BASE_URL: z.string().url().default('https://api.github.com'),
  GITHUB_ACCESS_TOKEN: z.string().optional(),

  WEIGHT_STARS: z.coerce.number().min(0).max(1).default(0.5),
  WEIGHT_FORKS: z.coerce.number().min(0).max(1).default(0.3),
  WEIGHT_RECENCY: z.coerce.number().min(0).max(1).default(0.2),
});

const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errorMessages = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  const { WEIGHT_STARS, WEIGHT_FORKS, WEIGHT_RECENCY } = parsed.data;
  const totalWeight = WEIGHT_STARS + WEIGHT_FORKS + WEIGHT_RECENCY;

  if (Math.abs(totalWeight - 1.0) > 0.001) {
    throw new Error(
      `Score weights must sum to 1.0, but got ${totalWeight} ` +
        `(stars: ${WEIGHT_STARS}, forks: ${WEIGHT_FORKS}, recency: ${WEIGHT_RECENCY})`
    );
  }

  return parsed.data;
};

export const env = parseEnv();

export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  github: {
    baseUrl: env.GITHUB_API_BASE_URL,
    accessToken: env.GITHUB_ACCESS_TOKEN,
  },
  scoring: {
    weights: {
      stars: env.WEIGHT_STARS,
      forks: env.WEIGHT_FORKS,
      recency: env.WEIGHT_RECENCY,
    },
  },
} as const;

export type Config = typeof config;
