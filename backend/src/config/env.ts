import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5002'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(1, 'JWT secret is required').default('fallback-jwt-secret-for-development-only'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'Refresh token secret is required').default('fallback-refresh-secret-for-development-only'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
  FRONTEND_URL: z.string().default('https://1753website-production.up.railway.app'),
  BACKEND_URL: z.string().default('https://1753website-production.up.railway.app'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  // Security
  BCRYPT_ROUNDS: z.string().default('12'),
  
  // Email (all optional for now)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),
  
  // Payment - Viva Wallet (all optional)
  VIVA_WALLET_CLIENT_ID: z.string().optional(),
  VIVA_WALLET_CLIENT_SECRET: z.string().optional(),
  VIVA_WALLET_ENVIRONMENT: z.enum(['demo', 'production']).default('demo'),
  VIVA_WALLET_WEBHOOK_SECRET: z.string().optional(),
  
  // Judge.me (optional)
  JUDGEME_API_TOKEN: z.string().optional(),
  JUDGEME_SHOP_DOMAIN: z.string().optional(),
  
  // 3PL (optional)
  THREPL_API_URL: z.string().optional(),
  THREPL_API_KEY: z.string().optional(),
  THREPL_WEBHOOK_SECRET: z.string().optional(),
  
  // Analytics (optional)
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  FACEBOOK_PIXEL_ID: z.string().optional(),
  
  // Social Media (optional)
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  FACEBOOK_ACCESS_TOKEN: z.string().optional(),
  
  // Storage (optional)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Content delivery (optional)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: z.string().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),

  // Drip (optional)
  DRIP_API_TOKEN: z.string().optional(),
  DRIP_ACCOUNT_ID: z.string().optional(),

  // OpenAI (optional)
  OPENAI_API_KEY: z.string().optional()
})

export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)
    
    // Log startup info
    console.log(`🔧 Environment: ${parsed.NODE_ENV}`)
    console.log(`🗄️  Database: ${parsed.DATABASE_URL ? 'Connected' : 'Missing'}`)
    
    // Log warnings for missing important but optional variables in production
    if (parsed.NODE_ENV === 'production') {
      const warnings = []
      
      if (!parsed.OPENAI_API_KEY) warnings.push('OPENAI_API_KEY')
      if (!parsed.DRIP_API_TOKEN) warnings.push('DRIP_API_TOKEN')
      if (!parsed.SMTP_HOST) warnings.push('SMTP_HOST')
      
      if (warnings.length > 0) {
        console.warn(`⚠️  Missing optional environment variables: ${warnings.join(', ')}`)
        console.warn('Some features may be disabled.')
      }
    }
    
    return parsed
  } catch (error) {
    console.error('❌ Environment validation failed:')
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    
    // In production, create a minimal config and continue
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Creating fallback config for production...')
      
      // Ensure we have the most critical variables
      if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is required in production!')
        process.exit(1)
      }
      
      return {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || '5002',
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-for-production',
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-for-production',
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
        FRONTEND_URL: process.env.FRONTEND_URL || 'https://1753skincare.com',
        BACKEND_URL: process.env.BACKEND_URL || 'https://1753website-production.up.railway.app',
        RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000',
        RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '1000',
        BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || '12',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
        // Include all other env vars as-is
        ...Object.fromEntries(
          Object.entries(process.env).filter(([key]) => 
            !['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'].includes(key)
          )
        )
      } as any
    }
    
    process.exit(1)
  }
}

export const env = validateEnv() 