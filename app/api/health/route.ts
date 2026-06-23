import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db/prisma'

/**
 * Health Check Endpoint
 * 
 * Returns system health status for monitoring
 * Checks database connectivity and returns 200 OK if healthy
 */

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
        responseTime: `${responseTime}ms`,
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      { status: 200 }
    )
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
