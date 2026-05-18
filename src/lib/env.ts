import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32).optional(),
    AUTH_URL: z.string().url().optional(),
    AUTH_TRUST_HOST: z.coerce.boolean().default(true),
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(1).default('Wyweb <noreply@wyweb.es>'),
    EMAIL_TO_LEADS: z.string().email().default('hola@wyweb.es'),
    S3_ENDPOINT: z.string().url().optional(),
    S3_REGION: z.string().min(1).optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    S3_PUBLIC_URL: z.string().url().optional(),
    REDIS_URL: z.string().url().optional(),
    APP_ENCRYPTION_KEY: z.string().min(32).optional(),
    CRON_SECRET: z.string().min(16).optional(),
    SENTRY_DSN: z.string().url().optional(),
    BILLING_PROVIDER: z
      .enum(['noop', 'self-built', 'holded', 'quaderno'])
      .default('self-built'),
    GITHUB_REPO_URL: z
      .string()
      .url()
      .default('https://github.com/PabloFuentess97/wyweb'),
    GITHUB_DEFAULT_BRANCH: z.string().min(1).default('main'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_BRAND: z.enum(['wyweb']).default('wyweb'),
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().min(1).optional(),
    NEXT_PUBLIC_PLAUSIBLE_HOST: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_TO_LEADS: process.env.EMAIL_TO_LEADS,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
    REDIS_URL: process.env.REDIS_URL,
    APP_ENCRYPTION_KEY: process.env.APP_ENCRYPTION_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    BILLING_PROVIDER: process.env.BILLING_PROVIDER,
    GITHUB_REPO_URL: process.env.GITHUB_REPO_URL,
    GITHUB_DEFAULT_BRANCH: process.env.GITHUB_DEFAULT_BRANCH,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BRAND: process.env.NEXT_PUBLIC_BRAND,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_PLAUSIBLE_HOST: process.env.NEXT_PUBLIC_PLAUSIBLE_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  emptyStringAsUndefined: true,
});
