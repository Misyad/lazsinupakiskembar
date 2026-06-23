import { vi } from 'vitest'
import type { User, Role, House, CoinBox, Withdrawal, CashTransaction } from '@prisma/client'

// Mock Prisma Client
//
// Returns a SINGLE shared instance: $transaction invokes its callback with the
// same client, so mocks set on `client.model.method` are the ones the service
// sees inside `prisma.$transaction(async (tx) => ...)`. Every model exposes the
// full method surface used anywhere in the services to avoid "undefined is not a
// function" when a service calls a method a given test didn't anticipate.
export const mockPrismaClient = () => {
  const model = () => ({
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  })

  const client: any = {
    user: model(),
    house: model(),
    coinBox: model(),
    withdrawal: model(),
    cashTransaction: model(),
    coinBoxAssignment: model(),
    area: model(),
    financialCategory: model(),
    auditLog: model()
  }

  // Run the transaction callback against this same client so the test's mocks apply.
  client.$transaction = vi.fn(async (callback: (tx: typeof client) => unknown) => callback(client))

  return client
}

// Mock User Factory
export const createMockUser = (overrides?: Partial<User>): User => {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phone: '081234567890',
    passwordHash: '$2a$10$testHashedPassword',
    status: 'ACTIVE',
    lastLoginAt: new Date('2026-05-01'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-05-01'),
    deletedAt: null,
    ...overrides
  } as User
}

// Mock House Factory
export const createMockHouse = (overrides?: Partial<House>): House => {
  return {
    id: 1,
    areaId: 1,
    name: 'Keluarga Test',
    phone: '081234567890',
    address: 'Jl. Test No. 123',
    rtRw: 'RT01/RW02',
    active: true,
    joinedAt: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides
  } as House
}

// Mock CoinBox Factory
export const createMockCoinBox = (overrides?: Partial<CoinBox>): CoinBox => {
  return {
    id: 1,
    boxNumber: 'TEST-001',
    status: 'ACTIVE',
    distributedAt: new Date('2026-01-15'),
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    deletedAt: null,
    ...overrides
  } as CoinBox
}

// Mock Withdrawal Factory
export const createMockWithdrawal = (overrides?: Partial<Withdrawal>): Withdrawal => {
  return {
    id: 1,
    coinBoxId: 1,
    houseId: 1,
    collectorId: 1,
    amount: 50000,
    notes: 'Test withdrawal',
    collectedAt: new Date('2026-05-15'),
    status: 'PENDING',
    validatedAt: null,
    rejectedAt: null,
    voidedAt: null,
    voidReason: null,
    createdAt: new Date('2026-05-15'),
    updatedAt: new Date('2026-05-15'),
    ...overrides
  } as Withdrawal
}

// Mock CashTransaction Factory
export const createMockCashTransaction = (overrides?: Partial<CashTransaction>): CashTransaction => {
  return {
    id: 1,
    categoryId: 1,
    withdrawalId: 1,
    type: 'INCOME',
    status: 'VALIDATED',
    referenceType: 'WITHDRAWAL',
    referenceId: 1,
    amount: 50000,
    description: 'Test transaction',
    reason: null,
    createdById: 1,
    validatedById: 2,
    validatedAt: new Date('2026-05-16'),
    rejectedAt: null,
    voidedAt: null,
    transactionAt: new Date('2026-05-15'),
    createdAt: new Date('2026-05-15'),
    updatedAt: new Date('2026-05-16'),
    ...overrides
  } as CashTransaction
}

// Mock Request with Headers
export const createMockRequest = (
  body?: any,
  headers?: Record<string, string>
): Request => {
  return new Request('http://localhost:3000/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })
}

// Mock Authenticated User Session
export const mockAuthSession = (user: Partial<User> = {}) => {
  const mockUser = createMockUser(user)
  return {
    user: mockUser,
    token: 'mock-session-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}

// Test Date Helpers
export const testDates = {
  now: new Date('2026-05-20T10:00:00Z'),
  yesterday: new Date('2026-05-19T10:00:00Z'),
  tomorrow: new Date('2026-05-21T10:00:00Z'),
  lastWeek: new Date('2026-05-13T10:00:00Z'),
  nextWeek: new Date('2026-05-27T10:00:00Z'),
  lastMonth: new Date('2026-04-20T10:00:00Z'),
  nextMonth: new Date('2026-06-20T10:00:00Z')
}
