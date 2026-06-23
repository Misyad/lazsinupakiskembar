/**
 * Error Monitoring Integration
 * 
 * Captures unhandled errors and promise rejections
 * Provides integration points for external monitoring services
 */

import { logger, logError } from './logger'

type ErrorContext = Record<string, unknown>

/**
 * Initialize error monitoring
 * Sets up handlers for unhandled errors
 */
export function initErrorMonitoring() {
  // Capture unhandled promise rejections
  if (typeof process !== 'undefined') {
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      logError(error, {
        type: 'unhandledRejection',
        promise: String(promise)
      })
    })

    // Capture uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logError(error, {
        type: 'uncaughtException'
      })
      
      // Exit process after logging (let process manager restart)
      setTimeout(() => {
        process.exit(1)
      }, 1000)
    })
  }

  logger.info('Error monitoring initialized')
}

/**
 * Capture error with context
 */
export function captureError(
  error: Error,
  context?: ErrorContext
) {
  logError(error, {
    ...context,
    capturedAt: new Date().toISOString()
  })

  // Integration point for external services (Sentry, etc.)
  if (process.env.SENTRY_DSN) {
    // TODO: Send to Sentry
    // Sentry.captureException(error, { extra: context })
  }
}

/**
 * Capture message with level
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
) {
  logger.log(level, message, context)

  // Integration point for external services
  if (process.env.SENTRY_DSN && level === 'error') {
    // TODO: Send to Sentry
    // Sentry.captureMessage(message, { level, extra: context })
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error(String(error)),
        {
          function: fn.name,
          ...context
        }
      )
      throw error
    }
  }) as T
}
