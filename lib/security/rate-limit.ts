import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple in-memory rate limiter for API routes
 * 
 * Tracks requests per IP and enforces limits
 * For production, consider Redis-based rate limiting
 */

type RateLimitStore = Map<string, { count: number; resetTime: number }>

const store: RateLimitStore = new Map()

export type RateLimitConfig = {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Max requests per window
}

// Default configuration: 100 requests per 15 minutes
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 100
}

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Rate limit middleware
 * Returns null if allowed, Response if rate limited
 */
export function rateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): NextResponse | null {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config }
  const clientIp = getClientIp(request)
  const now = Date.now()

  const clientData = store.get(clientIp)

  if (!clientData || now > clientData.resetTime) {
    // New window or expired window
    store.set(clientIp, {
      count: 1,
      resetTime: now + windowMs
    })
    return null // Allow request
  }

  if (clientData.count >= maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((clientData.resetTime - now) / 1000)
    
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': clientData.resetTime.toString()
        }
      }
    )
  }

  // Increment count and allow request
  clientData.count++
  store.set(clientIp, clientData)

  return null // Allow request
}

/**
 * Cleanup expired entries (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [ip, data] of store.entries()) {
    if (now > data.resetTime) {
      store.delete(ip)
    }
  }
}

// Auto cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 10 * 60 * 1000)
}
