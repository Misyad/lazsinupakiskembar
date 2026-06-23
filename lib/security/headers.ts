import { NextResponse } from 'next/server'

/**
 * Security Headers Middleware
 * 
 * Adds security headers to protect against common web vulnerabilities:
 * - XSS attacks
 * - Clickjacking
 * - MIME sniffing
 * - etc.
 */

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set(
    'X-XSS-Protection',
    '1; mode=block'
  )

  // Prevent MIME sniffing
  response.headers.set(
    'X-Content-Type-Options',
    'nosniff'
  )

  // Prevent clickjacking
  response.headers.set(
    'X-Frame-Options',
    'DENY'
  )

  // Referrer policy
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  )

  // Content Security Policy (adjust based on your needs)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join('; ')
  )

  // HTTPS enforcement (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  // Remove server identification
  response.headers.delete('X-Powered-By')

  return response
}
