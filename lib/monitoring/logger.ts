/**
 * Application Logger Configuration
 * 
 * Structured logging with Winston
 * Supports different log levels, formats, and outputs
 */

import winston from 'winston'
import path from 'path'

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * Custom log format with timestamp and context
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

/**
 * Console format for development (pretty print)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`
    }
    return msg
  })
)

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: 'koinnu-ranting-system',
    environment: NODE_ENV
  },
  transports: [
    // Error logs - separate file for errors only
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    
    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ]
})

/**
 * Add console transport for development
 */
if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat
    })
  )
}

/**
 * Add console transport for production with JSON format
 */
if (NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Console({
      format: logFormat
    })
  )
}

/**
 * Log levels:
 * - error: Errors that need immediate attention
 * - warn: Warning conditions
 * - info: Informational messages
 * - http: HTTP request logs
 * - debug: Debug information
 */

export { logger }

/**
 * Helper function to log HTTP requests
 */
export function logHttpRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: number
) {
  logger.http('HTTP Request', {
    method,
    path,
    statusCode,
    duration,
    userId
  })
}

/**
 * Helper function to log errors with context
 */
export function logError(
  error: Error,
  context?: Record<string, unknown>
) {
  logger.error(error.message, {
    stack: error.stack,
    ...context
  })
}

/**
 * Helper function to log audit events
 */
export function logAudit(
  action: string,
  userId: number,
  entityType: string,
  entityId: string | number,
  metadata?: Record<string, unknown>
) {
  logger.info('Audit Event', {
    action,
    userId,
    entityType,
    entityId,
    ...metadata
  })
}
