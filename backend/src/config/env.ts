import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  
  // Database
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'Refresh token secret must be at least 32 characters'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  BACKEND_URL: z.string().default('http://localhost:5000'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  // Security
  BCRYPT_ROUNDS: z.string().default('12'),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),
  
  // Payment - Viva Wallet
  VIVA_WALLET_CLIENT_ID: z.string().optional(),
  VIVA_WALLET_CLIENT_SECRET: z.string().optional(),
  VIVA_WALLET_ENVIRONMENT: z.enum(['demo', 'production']).default('demo'),
  VIVA_WALLET_WEBHOOK_SECRET: z.string().optional(),
  
  // Judge.me
  JUDGEME_API_TOKEN: z.string().optional(),
  JUDGEME_SHOP_DOMAIN: z.string().optional(),
  
  // 3PL
  THREPL_API_URL: z.string().optional(),
  THREPL_API_KEY: z.string().optional(),
  THREPL_WEBHOOK_SECRET: z.string().optional(),
  
  // File upload
  MAX_FILE_SIZE: z.string().default('5242880'),
  UPLOAD_DIR: z.string().default('uploads'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  
  // Newsletter - Drip.com
  DRIP_API_TOKEN: z.string().optional(),
  DRIP_ACCOUNT_ID: z.string().optional(),
  
  // Redis (optional)
  REDIS_URL: z.string().optional(),
})

export type EnvConfig = z.infer<typeof envSchema>

export const validateEnv = (): EnvConfig => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
} 