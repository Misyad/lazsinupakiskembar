import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Setup test environment
beforeAll(() => {
  // Mock environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
  process.env.SESSION_SECRET = 'test-secret-key-for-testing-only'
})

// Cleanup after all tests
afterAll(() => {
  // Reset environment
})

// Global test utilities
global.testUtils = {
  mockUser: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'ADMIN_RANTING',
    status: 'ACTIVE'
  },
  mockHouse: {
    id: 1,
    name: 'Test House',
    address: 'Test Address',
    rtRw: 'RT01/RW02',
    active: true
  },
  mockCoinBox: {
    id: 1,
    boxNumber: 'TEST-001',
    status: 'ACTIVE'
  }
}

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
