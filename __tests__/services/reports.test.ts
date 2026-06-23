import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/src/lib/db/prisma'
import { generateReportData, parsePeriod } from '@/src/services/reports/service'
import { createMockWithdrawal, createMockCashTransaction, createMockCoinBox, createMockHouse, createMockUser } from '../utils/test-helpers'

vi.mock('@/src/lib/db/prisma', async () => {
  const { mockPrismaClient } = await import('../utils/test-helpers')
  return { prisma: mockPrismaClient() }
})

const db = prisma as any

describe('Reports Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parsePeriod', () => {
    it('should parse valid period string', () => {
      const result = parsePeriod('2026-05')
      
      expect(result).toBeDefined()
      expect(result?.year).toBe(2026)
      expect(result?.month).toBe(5)
    })

    it('should return null for invalid period format', () => {
      expect(parsePeriod('invalid')).toBeNull()
      expect(parsePeriod('2026')).toBeNull()
      expect(parsePeriod('2026-13')).toBeNull()
      expect(parsePeriod('2026-00')).toBeNull()
    })

    it('should handle edge case months', () => {
      const jan = parsePeriod('2026-01')
      const dec = parsePeriod('2026-12')
      
      expect(jan?.month).toBe(1)
      expect(dec?.month).toBe(12)
    })
  })

  describe('generateReportData', () => {
    it('should generate report with summary and transactions', async () => {
      const mockWithdrawals = [
        {
          ...createMockWithdrawal({ id: 1, amount: 50000, status: 'VALIDATED' }),
          coinBox: createMockCoinBox({ boxNumber: 'KNU-001' }),
          house: createMockHouse({ name: 'House 1' }),
          collector: createMockUser({ name: 'Collector 1' })
        },
        {
          ...createMockWithdrawal({ id: 2, amount: 30000, status: 'PENDING' }),
          coinBox: createMockCoinBox({ boxNumber: 'KNU-002' }),
          house: createMockHouse({ name: 'House 2' }),
          collector: createMockUser({ name: 'Collector 2' })
        }
      ]

      const mockTransactions = [
        {
          ...createMockCashTransaction({ id: 1, type: 'INCOME', amount: 50000, status: 'VALIDATED' }),
          category: { id: 1, name: 'Penarikan Koin', code: 'KOIN', type: 'INCOME' },
          createdBy: createMockUser({ name: 'User 1' })
        },
        {
          ...createMockCashTransaction({ id: 2, type: 'EXPENSE', amount: 20000, status: 'VALIDATED' }),
          category: { id: 2, name: 'Operasional', code: 'OPS', type: 'EXPENSE' },
          createdBy: createMockUser({ name: 'User 2' })
        }
      ]

      db.withdrawal.findMany.mockResolvedValue(mockWithdrawals)
      db.cashTransaction.findMany.mockResolvedValue(mockTransactions)
      db.house.count.mockResolvedValue(50)
      db.coinBox.count.mockResolvedValue(40)

      const period = { year: 2026, month: 5 }
      const result = await generateReportData(period)

      expect(result).toBeDefined()
      expect(result.summary).toBeDefined()
      expect(result.summary.periodLabel).toBe('Mei 2026')
      expect(result.summary.totalIncome).toBe(50000)
      expect(result.summary.totalExpense).toBe(20000)
      expect(result.summary.balance).toBe(30000)
      expect(result.summary.validatedWithdrawals).toBe(1)
      expect(result.summary.pendingWithdrawals).toBe(1)
      expect(result.withdrawals).toHaveLength(2)
      expect(result.transactions).toHaveLength(2)
    })

    it('should calculate correct totals with multiple transaction types', async () => {
      const mockTransactions = [
        {
          ...createMockCashTransaction({ type: 'INCOME', amount: 100000, status: 'VALIDATED' }),
          category: { id: 1, name: 'Income 1', code: 'INC1', type: 'INCOME' },
          createdBy: null
        },
        {
          ...createMockCashTransaction({ type: 'INCOME', amount: 50000, status: 'VALIDATED' }),
          category: { id: 1, name: 'Income 2', code: 'INC2', type: 'INCOME' },
          createdBy: null
        },
        {
          ...createMockCashTransaction({ type: 'EXPENSE', amount: 30000, status: 'VALIDATED' }),
          category: { id: 2, name: 'Expense 1', code: 'EXP1', type: 'EXPENSE' },
          createdBy: null
        },
        {
          ...createMockCashTransaction({ type: 'ADJUSTMENT', amount: 10000, status: 'VALIDATED' }),
          category: { id: 3, name: 'Adjustment', code: 'ADJ', type: 'ADJUSTMENT' },
          createdBy: null
        }
      ]

      db.withdrawal.findMany.mockResolvedValue([])
      db.cashTransaction.findMany.mockResolvedValue(mockTransactions)
      db.house.count.mockResolvedValue(0)
      db.coinBox.count.mockResolvedValue(0)

      const period = { year: 2026, month: 5 }
      const result = await generateReportData(period)

      expect(result.summary.totalIncome).toBe(150000)
      expect(result.summary.totalExpense).toBe(30000)
      expect(result.summary.totalAdjustment).toBe(10000)
      expect(result.summary.balance).toBe(130000)
    })

    it('should filter transactions by status VALIDATED only', async () => {
      const mockTransactions = [
        {
          ...createMockCashTransaction({ type: 'INCOME', amount: 50000, status: 'VALIDATED' }),
          category: { id: 1, name: 'Cat 1', code: 'C1', type: 'INCOME' },
          createdBy: null
        },
        {
          ...createMockCashTransaction({ type: 'INCOME', amount: 30000, status: 'PENDING' }),
          category: { id: 1, name: 'Cat 2', code: 'C2', type: 'INCOME' },
          createdBy: null
        },
        {
          ...createMockCashTransaction({ type: 'INCOME', amount: 20000, status: 'REJECTED' }),
          category: { id: 1, name: 'Cat 3', code: 'C3', type: 'INCOME' },
          createdBy: null
        }
      ]

      db.withdrawal.findMany.mockResolvedValue([])
      db.cashTransaction.findMany.mockResolvedValue(mockTransactions)
      db.house.count.mockResolvedValue(0)
      db.coinBox.count.mockResolvedValue(0)

      const period = { year: 2026, month: 5 }
      const result = await generateReportData(period)

      expect(result.summary.totalIncome).toBe(50000)
    })
  })
})
