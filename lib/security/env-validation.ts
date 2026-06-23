/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at application startup
 * Provides clear error messages for missing or invalid configuration
 */

type EnvValidationError = {
  variable: string
  message: string
}

const errors: EnvValidationError[] = []

/**
 * Validate required environment variable exists
 */
function _required(name: string, value: string | undefined): string | null {
  if (!value || value.trim() === "") {
    errors.push({
      variable: name,
      message: `${name} is not set or empty`,
    })
    return null
  }
  return value
}

/**
 * Validate optional environment variable with default
 */
function validateDatabaseUrl(url: string | undefined): void {
  if (!url) {
    errors.push({
      variable: 'DATABASE_URL',
      message: 'DATABASE_URL is required'
    })
    return
  }

  const pattern = /^postgresql:\/\/.+:.+@.+:\d+\/.+$/
  if (!pattern.test(url)) {
    errors.push({
      variable: 'DATABASE_URL',
      message: 'DATABASE_URL must be in format: postgresql://user:pass@host:port/database'
    })
  }
}

/**
 * Validate SESSION_SECRET minimum length
 */
function validateSessionSecret(secret: string | undefined): void {
  const minLength = 32
  
  if (!secret) {
    errors.push({
      variable: 'SESSION_SECRET',
      message: 'SESSION_SECRET is required'
    })
    return
  }

  if (secret.length < minLength) {
    errors.push({
      variable: 'SESSION_SECRET',
      message: `SESSION_SECRET must be at least ${minLength} characters long`
    })
  }
}

/**
 * Validate NODE_ENV value
 */
function validateNodeEnv(env: string | undefined): void {
  const validValues = ['development', 'production', 'test']
  
  if (env && !validValues.includes(env)) {
    errors.push({
      variable: 'NODE_ENV',
      message: `NODE_ENV must be one of: ${validValues.join(', ')}`
    })
  }
}

/**
 * Run all environment validations
 */
export function validateEnvironment(): void {
  errors.length = 0 // Reset errors

  // Critical environment variables
  validateDatabaseUrl(process.env.DATABASE_URL)
  validateSessionSecret(process.env.SESSION_SECRET)
  validateNodeEnv(process.env.NODE_ENV)

  // Optional but recommended
  if (!process.env.APP_URL && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  APP_URL not set - recommended for production')
  }

  // Report errors
  if (errors.length > 0) {
    console.error('\n❌ Environment Validation Failed:\n')
    errors.forEach((error) => {
      console.error(`  - ${error.variable}: ${error.message}`)
    })
    console.error('\nPlease fix the above errors and restart the application.\n')
    process.exit(1)
  }

  console.log('✓ Environment validation passed')
}

/**
 * Get validated environment variable
 */
export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is not set`)
  }
  return value || defaultValue!
}
