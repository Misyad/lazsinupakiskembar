# Monitoring & Observability - KOINNU Ranting System

## Overview

Comprehensive monitoring infrastructure untuk production observability menggunakan Winston logging, health checks, dan error monitoring.

## Components

### 1. Application Logger (`lib/monitoring/logger.ts`)

**Purpose:** Structured logging dengan multiple outputs dan log levels

**Features:**
- Structured JSON logging
- File rotation (10MB max, 5 error files, 10 combined files)
- Console output (pretty print di development, JSON di production)
- Multiple log levels: error, warn, info, http, debug
- Automatic timestamp dan service metadata

**Usage:**

```typescript
import { logger, logHttpRequest, logError, logAudit } from '@/lib/monitoring/logger'

// Basic logging
logger.info('Application started')
logger.error('Database connection failed', { error: err })

// HTTP request logging
logHttpRequest('POST', '/api/auth/login', 200, 145, userId)

// Error logging with context
logError(error, { userId, action: 'createWithdrawal' })

// Audit logging
logAudit('user.login', userId, 'User', userId, { ipAddress })
```

**Configuration:**

Environment variables:
- `LOG_DIR` - Log directory (default: `./logs`)
- `LOG_LEVEL` - Minimum log level (default: `info`)
- `NODE_ENV` - Environment (development/production)

**Log Files:**
- `logs/error.log` - Error level only
- `logs/combined.log` - All log levels

### 2. Health Check Endpoint (`/api/health`)

**Purpose:** System health monitoring untuk load balancers dan monitoring services

**Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-06-23T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "responseTime": "15ms",
  "version": "1.0.0",
  "environment": "production"
}
```

**Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-06-23T10:00:00.000Z",
  "database": "disconnected",
  "responseTime": "5000ms",
  "error": "Connection timeout"
}
```

**HTTP Status Codes:**
- `200 OK` - System healthy
- `503 Service Unavailable` - System unhealthy

**Usage:**
```bash
# Manual check
curl http://localhost:3000/api/health

# Monitoring service check (Uptime Robot, Pingdom, etc.)
Configure URL: https://api.lazisnupakem.projecthasan.com/api/health
Expected: 200 OK response
Check interval: 1-5 minutes
```

### 3. Error Monitoring (`lib/monitoring/error-monitoring.ts`)

**Purpose:** Capture dan log unhandled errors, promise rejections

**Features:**
- Unhandled promise rejection capture
- Uncaught exception handling
- Error context tracking
- Integration points untuk Sentry/external services
- Error wrapping untuk async functions

**Setup:**

Initialize di application startup:
```typescript
import { initErrorMonitoring } from '@/lib/monitoring/error-monitoring'

// In your app initialization
initErrorMonitoring()
```

**Usage:**

```typescript
import { captureError, captureMessage, withErrorHandling } from '@/lib/monitoring/error-monitoring'

// Manual error capture
try {
  // risky operation
} catch (error) {
  captureError(error, { userId, action: 'createUser' })
}

// Capture message
captureMessage('Critical threshold exceeded', 'warning', { metric: 'cpu' })

// Wrap async function
const safeFunction = withErrorHandling(async (userId: number) => {
  // function logic
}, { functionName: 'processUser' })
```

## Integration with External Services

### Sentry Integration (Optional)

Install Sentry:
```bash
npm install @sentry/node @sentry/nextjs
```

Configure in `error-monitoring.ts`:
```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})

// Update captureError function
export function captureError(error: Error, context?: ErrorContext) {
  logError(error, context)
  Sentry.captureException(error, { extra: context })
}
```

### Log Aggregation Services

**Options:**
- **Logtail** - Simple, affordable
- **Datadog** - Comprehensive monitoring
- **New Relic** - APM + logging
- **Elasticsearch + Kibana** - Self-hosted

**Setup:**
Configure log shipping from `logs/` directory or use service-specific Winston transport.

## Monitoring Best Practices

### Log Levels
- **error** - Unexpected errors requiring attention
- **warn** - Warning conditions (degraded performance, recoverable errors)
- **info** - Normal operations (startup, shutdown, major actions)
- **http** - HTTP requests (useful for traffic analysis)
- **debug** - Detailed debugging information (use sparingly in production)

### What to Log
✅ Authentication attempts (success/failure)
✅ Authorization failures
✅ Data mutations (create, update, delete)
✅ External API calls
✅ Performance bottlenecks
✅ Business-critical operations

❌ Sensitive data (passwords, tokens, personal info)
❌ Excessive debug information in production
❌ Normal successful operations (too noisy)

### Performance Considerations
- Use appropriate log levels
- Implement log sampling for high-traffic endpoints
- Rotate logs regularly to prevent disk space issues
- Use async logging to avoid blocking operations

## Troubleshooting

### Logs not appearing
- Check `LOG_DIR` is writable
- Verify `LOG_LEVEL` is set correctly
- Check file permissions on log directory
- Ensure Winston is properly initialized

### Health check failing
- Verify database connection string
- Check database is running and accessible
- Check network connectivity
- Review error message in 503 response

### High log volume
- Increase log level (error/warn only in production)
- Implement sampling for high-traffic routes
- Set up log rotation
- Use log aggregation service with filtering
