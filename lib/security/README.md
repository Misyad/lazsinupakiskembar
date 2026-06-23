# Security Implementation - KOINNU Ranting System

## Overview

Security hardening untuk production deployment KOINNU Ranting System.

## Implemented Security Features

### 1. Rate Limiting (`lib/security/rate-limit.ts`)

**Purpose:** Prevent API abuse and DDoS attacks

**Configuration:**
- Default: 100 requests per 15 minutes per IP
- Customizable window and max requests
- Returns 429 status when limit exceeded

**Usage in API Routes:**
```typescript
import { rateLimit } from '@/lib/security/rate-limit'

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  })
  
  if (rateLimitResponse) {
    return rateLimitResponse // 429 Too Many Requests
  }
  
  // Continue with normal logic
}
```

**Production Note:** Consider Redis-based rate limiting for multi-instance deployments

### 2. Security Headers (`lib/security/headers.ts`)

**Purpose:** Protect against XSS, clickjacking, MIME sniffing

**Headers Added:**
- `X-XSS-Protection`: Prevents XSS attacks
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-Frame-Options`: Prevents clickjacking
- `Referrer-Policy`: Controls referrer information
- `Content-Security-Policy`: Restricts resource loading
- `Strict-Transport-Security`: Enforces HTTPS (production only)

**Usage in Middleware:**
```typescript
import { addSecurityHeaders } from '@/lib/security/headers'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}
```

### 3. Environment Validation (`lib/security/env-validation.ts`)

**Purpose:** Ensure required configuration is present and valid

**Validated Variables:**
- `DATABASE_URL` - Required, valid PostgreSQL format
- `SESSION_SECRET` - Required, minimum 32 characters
- `NODE_ENV` - Optional, must be development/production/test
- `APP_URL` - Recommended for production

**Usage at Application Startup:**
```typescript
import { validateEnvironment } from '@/lib/security/env-validation'

// In your application entry point
validateEnvironment()
```

**Error Handling:**
- Exits with code 1 if validation fails
- Prints clear error messages for each issue
- Prevents application from running with invalid configuration

## Integration Guide

### Step 1: Update Middleware

Edit `middleware.ts` to include security features:

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { addSecurityHeaders } from '@/lib/security/headers'
import { rateLimit } from '@/lib/security/rate-limit'

export function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse
  }
  
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}
```

### Step 2: Validate Environment on Startup

Add to your application initialization (e.g., in API routes or root layout):

```typescript
import { validateEnvironment } from '@/lib/security/env-validation'

if (process.env.NODE_ENV === 'production') {
  validateEnvironment()
}
```

### Step 3: Apply Rate Limiting to Sensitive Routes

For routes that need stricter limits:

```typescript
// Stricter limit for auth endpoints
const authRateLimit = rateLimit(request, {
  windowMs: 5 * 60 * 1000,  // 5 minutes
  maxRequests: 5             // 5 attempts
})
```

## Security Checklist

### Pre-Production
- [ ] Environment validation passes
- [ ] Security headers applied to all responses
- [ ] Rate limiting active on API routes
- [ ] DATABASE_URL uses strong password
- [ ] SESSION_SECRET is cryptographically random (32+ chars)
- [ ] HTTPS enforced in production
- [ ] Backup system configured and tested

### Production Monitoring
- [ ] Monitor rate limit violations
- [ ] Track authentication failures
- [ ] Review security headers regularly
- [ ] Update CSP as needed for new features
- [ ] Regular security audits

## Additional Security Recommendations

### Not Yet Implemented (Future Work)
1. **CSRF Protection** - Token-based protection for state-changing operations
2. **Input Sanitization** - Comprehensive validation library integration
3. **SQL Injection Prevention** - Already handled by Prisma ORM
4. **API Authentication Tokens** - JWT or session tokens with expiration
5. **Audit Logging** - Already implemented via audit_logs table
6. **Rate Limiting with Redis** - For distributed systems
7. **IP Whitelisting** - For admin routes
8. **2FA/MFA** - Two-factor authentication for sensitive accounts

### Best Practices
- Never commit secrets to git
- Use environment-specific .env files
- Rotate SESSION_SECRET regularly
- Keep dependencies updated
- Regular security audits
- Monitor for suspicious activity

## Troubleshooting

### Rate Limit Issues
If legitimate users hit rate limits:
- Increase `maxRequests` or `windowMs`
- Implement user-based rate limiting
- Use Redis for distributed rate limiting

### CSP Violations
If resources fail to load:
- Check browser console for CSP errors
- Update Content-Security-Policy in headers.ts
- Add specific domains to allowed sources

### Environment Validation Fails
- Check all required variables are set
- Verify DATABASE_URL format
- Ensure SESSION_SECRET is long enough
- Check NODE_ENV value
