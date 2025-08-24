import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5002'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  // JWT - CRITICAL: No fallback secrets in production
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').refine(
    (val) => process.env.NODE_ENV !== 'production' || val !== 'fallback-jwt-secret-for-development-only',
    'JWT_SECRET must be set to a secure value in production'
  ),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'Refresh token secret must be at least 32 characters').refine(
    (val) => process.env.NODE_ENV !== 'production' || val !== 'fallback-refresh-secret-for-development-only',
    'REFRESH_TOKEN_SECRET must be set to a secure value in production'
  ),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // CORS - Secure configuration
  CORS_ORIGIN: z.string().refine(
    (val) => process.env.NODE_ENV !== 'production' || val !== '*',
    'CORS_ORIGIN must be set to specific domain(s) in production, not "*"'
  ).default(process.env.NODE_ENV === 'production' ? 'https://1753website-production.up.railway.app' : '*'),
  FRONTEND_URL: z.string().default('https://1753website-production.up.railway.app'),
  BACKEND_URL: z.string().default('https://1753websitebackend-production.up.railway.app'),
  
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
    
    // Log startup info in production-appropriate way
    if (parsed.NODE_ENV === 'development') {
      console.log(`🔧 Environment: ${parsed.NODE_ENV}`)
      console.log(`🗄️  Database: ${parsed.DATABASE_URL ? 'Connected' : 'Missing'}`)
    }
    
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

      // Security validation passed - log success
      console.log('🔒 Security validation passed: JWT secrets and CORS properly configured')
    }
    
    return parsed
  } catch (error) {
    console.error('❌ Environment validation failed:')
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    
    // In production, we MUST have proper security configuration
    if (process.env.NODE_ENV === 'production') {
      console.error('💥 CRITICAL: Cannot start in production without proper security configuration!')
      console.error('Please set the following environment variables:')
      console.error('  - JWT_SECRET (minimum 32 characters, cryptographically secure)')
      console.error('  - REFRESH_TOKEN_SECRET (minimum 32 characters, cryptographically secure)')
      console.error('  - CORS_ORIGIN (specific domain, not "*")')
      console.error('  - DATABASE_URL')
      console.error('')
      console.error('Example secure values:')
      console.error('  JWT_SECRET="$(openssl rand -base64 32)"')
      console.error('  REFRESH_TOKEN_SECRET="$(openssl rand -base64 32)"')
      console.error('  CORS_ORIGIN="https://yourdomain.com"')
      process.exit(1)
    }
    
    // Development fallback with warnings
    console.warn('⚠️  Using development fallback configuration...')
    console.warn('⚠️  This configuration is NOT suitable for production!')
    
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '5002',
      DATABASE_URL: process.env.DATABASE_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-for-development-only',
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-for-development-only',
      CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
      BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5002',
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000',
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
      BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || '12',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
      REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
      // Include all other env vars as-is
      ...Object.fromEntries(
        Object.entries(process.env).filter(([key]) => 
          !['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'CORS_ORIGIN'].includes(key)
        )
      )
    } as any
  }
}

export const env = validateEnv() 