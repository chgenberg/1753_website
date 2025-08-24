# 🔒 Production Security Setup Guide

## CRITICAL: Before Deploying to Production

This guide ensures your 1753 Skincare application is securely configured for production deployment.

## 🚨 Security Checklist

### 1. JWT Secrets (CRITICAL)

**Generate secure JWT secrets:**
```bash
# Generate JWT_SECRET (32+ characters)
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"

# Generate REFRESH_TOKEN_SECRET (different from JWT_SECRET)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
echo "REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET"
```

**Set in Railway/Production:**
```bash
# In Railway dashboard or CLI:
railway variables set JWT_SECRET="your_generated_secret_here"
railway variables set REFRESH_TOKEN_SECRET="your_different_generated_secret_here"
```

### 2. CORS Configuration (CRITICAL)

**❌ NEVER use in production:**
```bash
CORS_ORIGIN="*"  # Allows any domain - SECURITY RISK!
```

**✅ Use specific domain:**
```bash
# Single domain
CORS_ORIGIN="https://1753website-production.up.railway.app"

# Multiple domains (comma-separated)
CORS_ORIGIN="https://1753skincare.com,https://www.1753skincare.com"
```

### 3. Environment Variables for Production

**Required (MUST be set):**
```bash
NODE_ENV=production
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_32_char_secure_secret"
REFRESH_TOKEN_SECRET="your_different_32_char_secure_secret"
CORS_ORIGIN="https://yourdomain.com"
```

**Important (should be set):**
```bash
OPENAI_API_KEY="your_openai_key"
DRIP_API_TOKEN="your_drip_token"
DRIP_ACCOUNT_ID="your_drip_account_id"
SMTP_HOST="your_smtp_host"
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_password"
```

## 🛡️ Security Validation

The application will **automatically validate** security configuration on startup:

### ✅ Production Startup Success:
```
🔒 Security validation passed: JWT secrets and CORS properly configured
```

### ❌ Production Startup Failure:
```
💥 CRITICAL: Cannot start in production without proper security configuration!
Please set the following environment variables:
  - JWT_SECRET (minimum 32 characters, cryptographically secure)
  - REFRESH_TOKEN_SECRET (minimum 32 characters, cryptographically secure)
  - CORS_ORIGIN (specific domain, not "*")
  - DATABASE_URL
```

## 🚀 Railway Deployment Steps

### 1. Set Environment Variables
```bash
# Connect to your Railway project
railway login
railway link

# Set critical security variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set REFRESH_TOKEN_SECRET="$(openssl rand -base64 32)"
railway variables set CORS_ORIGIN="https://your-frontend-domain.com"
railway variables set DATABASE_URL="your_postgresql_url"

# Set optional but important variables
railway variables set OPENAI_API_KEY="your_openai_key"
railway variables set DRIP_API_TOKEN="your_drip_token"
```

### 2. Deploy
```bash
railway up
```

### 3. Verify Security
Check logs for the security validation message:
```bash
railway logs
# Look for: "🔒 Security validation passed: JWT secrets and CORS properly configured"
```

## 🔍 Security Best Practices

### JWT Secrets
- **Minimum 32 characters**
- **Cryptographically secure** (use `openssl rand -base64 32`)
- **Different secrets** for JWT and refresh tokens
- **Never commit to code** - use environment variables only

### CORS Configuration
- **Specific domains only** - never use "*" in production
- **Include all necessary domains** (www and non-www versions)
- **Use HTTPS only** in production

### Database
- **Use connection pooling** for better performance
- **Enable SSL** for database connections
- **Regular backups** configured

### Monitoring
- **Set up error tracking** (Sentry recommended)
- **Monitor logs** for security issues
- **Set up uptime monitoring**

## 🚨 Common Security Mistakes

### ❌ DON'T:
```bash
JWT_SECRET="fallback-jwt-secret-for-development-only"  # Weak secret
CORS_ORIGIN="*"                                        # Too permissive
NODE_ENV=development                                   # Wrong environment
```

### ✅ DO:
```bash
JWT_SECRET="$(openssl rand -base64 32)"               # Strong secret
CORS_ORIGIN="https://yourdomain.com"                 # Specific domain
NODE_ENV=production                                   # Correct environment
```

## 🆘 Troubleshooting

### Application won't start in production:
1. Check environment variables are set correctly
2. Verify JWT secrets are 32+ characters
3. Ensure CORS_ORIGIN is not "*"
4. Check DATABASE_URL is valid

### CORS errors in browser:
1. Verify CORS_ORIGIN matches your frontend domain exactly
2. Include both www and non-www versions if needed
3. Ensure using HTTPS in production

### JWT token errors:
1. Verify JWT_SECRET is set and secure
2. Check token expiration settings
3. Ensure REFRESH_TOKEN_SECRET is different from JWT_SECRET

## 📞 Support

If you encounter security configuration issues:
1. Check the application logs first
2. Verify all environment variables are set
3. Test with the security validation checklist above

Remember: **Security is not optional** - the application will refuse to start in production without proper configuration! 🔒 