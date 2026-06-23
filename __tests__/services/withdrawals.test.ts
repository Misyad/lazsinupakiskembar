import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/src/lib/db/prisma'
import { validateWithdrawal, rejectWithdrawal, createWithdrawal } from '@/src/services/withdrawals/service'
import { createMockWithdrawal, createMockCoinBox, createMockHouse } from '../utils/test-helpers'

vi.mock('@/src/lib/db/prisma', async () => {
  const { mockPrismaClient } = await import('../utils/test-helpers')
  return { prisma: mockPrismaClient() }
})

const db = prisma as any

// Build a withdrawal with the relations the service's `include` returns.
const withdrawalWithRelations = (overrides = {}) => ({
  ...createMockWithdrawal(overrides),
  coinBox: createMockCoinBox({ id: 1, status: 'ACTIVE' }),
  house: createMockHouse({ id: 1, active: true }),
  collector: { id: 1, name: 'Collector 1' }
})

describe('Withdrawal Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    db.auditLog.create.mockResolvedValue({})
  })

  describe('createWithdrawal', () => {
    it('should create a withdrawal successfully', async () => {
      const mockCoinBox = createMockCoinBox({ id: 1, status: 'ACTIVE' })
      const mockHouse = createMockHouse({ id: 1, active: true })
      const mockWithdrawal = withdrawalWithRelations({ amount: 50000, status: 'PENDING' })

      db.coinBox.findFirst.mockResolvedValue(mockCoinBox)
      db.house.findFirst.mockResolvedValue(mockHouse)
      db.coinBoxAssignment.findFirst.mockResolvedValue({
        id: 1, coinBoxId: 1, houseId: 1, status: 'ACTIVE', unassignedAt: null
      })
      db.withdrawal.create.mockResolvedValue(mockWithdrawal)

      const input = {
        coinBoxId: 1,
        houseId: 1,
        amount: 50000,
        notes: 'Test withdrawal',
        collectedAt: new Date('2026-05-15')
      }

      const result = await createWithdrawal(input, 1, '127.0.0.1')

      expect(result).toBeDefined()
      expect(result.amount).toBe(50000)
      expect(result.status).toBe('PENDING')
    })

    it('should throw error if amount is zero or negative', async () => {
      const input = {
        coinBoxId: 1,
        houseId: 1,
        amount: 0,
        notes: undefined,
        collectedAt: new Date()
      }

      await expect(createWithdrawal(input, 1, '127.0.0.1')).rejects.toThrow('Nominal penarikan harus lebih dari 0')
    })

    it('should throw error if coin box is not active', async () => {
      const mockCoinBox = createMockCoinBox({ id: 1, status: 'INACTIVE' })
      const mockHouse = createMockHouse({ id: 1, active: true })

      db.coinBox.findFirst.mockResolvedValue(mockCoinBox)
      db.house.findFirst.mockResolvedValue(mockHouse)

      const input = {
        coinBoxId: 1,
        houseId: 1,
        amount: 50000,
        notes: undefined,
        collectedAt: new Date()
      }

      await expect(createWithdrawal(input, 1, '127.0.0.1')).rejects.toThrow('Kaleng harus aktif untuk penarikan')
    })
  })

  describe('validateWithdrawal', () => {
    it('should validate a pending withdrawal successfully', async () => {
      const mockWithdrawal = withdrawalWithRelations({ id: 1, status: 'PENDING', collectorId: 1, amount: 50000 })

      db.withdrawal.findUnique.mockResolvedValue(mockWithdrawal)
      db.coinBoxAssignment.findFirst.mockResolvedValue({ id: 1, status: 'ACTIVE', unassignedAt: null })
      db.cashTransaction.findFirst.mockResolvedValue(null)
      db.financialCategory.findFirst.mockResolvedValue({ id: 1, code: 'KOIN_RUTIN' })
      db.withdrawal.updateMany.mockResolvedValue({ count: 1 })
      db.cashTransaction.create.mockResolvedValue({ id: 1 })
      db.withdrawal.findUniqueOrThrow.mockResolvedValue(
        withdrawalWithRelations({ id: 1, status: 'VALIDATED', collectorId: 1, amount: 50000 })
      )

      // actorId (2) differs from collectorId (1) — allowed.
      const result = await validateWithdrawal(1, 2, '127.0.0.1')

      expect(result).toBeDefined()
      expect(result.status).toBe('VALIDATED')
    })

    it('should throw error if withdrawal is not pending', async () => {
      db.withdrawal.findUnique.mockResolvedValue(
        withdrawalWithRelations({ id: 1, status: 'VALIDATED' })
      )

      await expect(validateWithdrawal(1, 2, '127.0.0.1')).rejects.toThrow('Hanya penarikan pending yang bisa divalidasi')
    })

    it('should throw error if collector tries to validate their own withdrawal', async () => {
      db.withdrawal.findUnique.mockResolvedValue(
        withdrawalWithRelations({ id: 1, status: 'PENDING', collectorId: 1 })
      )

      // actorId === collectorId (1) — self-validation blocked.
      await expect(validateWithdrawal(1, 1, '127.0.0.1')).rejects.toThrow('Collector tidak boleh memvalidasi penarikannya sendiri')
    })
  })

  describe('rejectWithdrawal', () => {
    it('should reject a pending withdrawal successfully', async () => {
      const mockWithdrawal = withdrawalWithRelations({ id: 1, status: 'PENDING' })

      db.withdrawal.findUnique.mockResolvedValue(mockWithdrawal)
      db.withdrawal.updateMany.mockResolvedValue({ count: 1 })
      db.withdrawal.findUniqueOrThrow.mockResolvedValue(
        withdrawalWithRelations({ id: 1, status: 'REJECTED' })
      )

      // Signature: rejectWithdrawal(id, actorId, reason, ipAddress)
      const result = await rejectWithdrawal(1, 2, 'Nominal tidak sesuai', '127.0.0.1')

      expect(result).toBeDefined()
      expect(result.status).toBe('REJECTED')
    })
  })
})
