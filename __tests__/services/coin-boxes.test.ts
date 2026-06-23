import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/src/lib/db/prisma'
import { createCoinBox, assignCoinBox, listCoinBoxes } from '@/src/services/coin-boxes/service'
import { createMockCoinBox, createMockHouse } from '../utils/test-helpers'

// Replace the prisma module with a shared mock client. The async factory dynamically
// imports the helper so it works around vi.mock hoisting (the factory runs before
// top-level imports are initialized).
vi.mock('@/src/lib/db/prisma', async () => {
  const { mockPrismaClient } = await import('../utils/test-helpers')
  return { prisma: mockPrismaClient() }
})

// `prisma` imported above IS the mocked client instance the service uses.
const db = prisma as any

describe('CoinBoxes Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCoinBox', () => {
    it('should create a coin box successfully', async () => {
      const mockCoinBox = createMockCoinBox({
        boxNumber: 'KNU-TEST-001',
        status: 'ACTIVE'
      })

      db.coinBox.create.mockResolvedValue(mockCoinBox)

      const input = {
        boxNumber: 'KNU-TEST-001',
        status: 'ACTIVE' as const,
        distributedAt: new Date('2026-05-01')
      }

      const result = await createCoinBox(input)

      expect(result).toBeDefined()
      expect(result.boxNumber).toBe('KNU-TEST-001')
      expect(result.status).toBe('ACTIVE')
      expect(db.coinBox.create).toHaveBeenCalledOnce()
    })

    it('should set default status to ACTIVE if not provided', async () => {
      const mockCoinBox = createMockCoinBox()
      db.coinBox.create.mockResolvedValue(mockCoinBox)

      const input = {
        boxNumber: 'KNU-TEST-002',
        status: undefined,
        distributedAt: undefined
      }

      await createCoinBox(input)

      expect(db.coinBox.create).toHaveBeenCalled()
      // Service falls back to "ACTIVE" when status is omitted.
      expect(db.coinBox.create.mock.calls[0][0].data.status).toBe('ACTIVE')
    })
  })

  describe('assignCoinBox', () => {
    it('should assign coin box to house successfully', async () => {
      const mockCoinBox = createMockCoinBox({ id: 1, status: 'ACTIVE' })
      const mockHouse = createMockHouse({ id: 1, active: true })
      const mockAssignment = {
        id: 1,
        coinBoxId: 1,
        houseId: 1,
        assignedAt: new Date(),
        unassignedAt: null,
        status: 'ACTIVE' as const,
        coinBox: mockCoinBox,
        house: mockHouse
      }

      // The service looks these up BEFORE opening the transaction.
      db.coinBox.findFirst.mockResolvedValue(mockCoinBox)
      db.house.findFirst.mockResolvedValue(mockHouse)
      db.coinBoxAssignment.findMany.mockResolvedValue([])
      db.coinBoxAssignment.updateMany.mockResolvedValue({ count: 0 })
      db.coinBoxAssignment.create.mockResolvedValue(mockAssignment)
      db.auditLog.create.mockResolvedValue({})

      const input = {
        houseId: 1,
        assignedAt: new Date('2026-05-15')
      }

      const result = await assignCoinBox(1, input, 1, '127.0.0.1')

      expect(result).toBeDefined()
      expect(result.coinBoxId).toBe(1)
      expect(result.houseId).toBe(1)
    })

    it('should throw error if coin box is not active', async () => {
      const mockCoinBox = createMockCoinBox({ id: 1, status: 'INACTIVE' })
      const mockHouse = createMockHouse({ id: 1, active: true })

      db.coinBox.findFirst.mockResolvedValue(mockCoinBox)
      db.house.findFirst.mockResolvedValue(mockHouse)

      const input = {
        houseId: 1,
        assignedAt: new Date()
      }

      await expect(assignCoinBox(1, input, 1, '127.0.0.1')).rejects.toThrow('Kaleng harus berstatus aktif')
    })

    it('should throw error if house is not active', async () => {
      const mockCoinBox = createMockCoinBox({ id: 1, status: 'ACTIVE' })
      const mockHouse = createMockHouse({ id: 1, active: false })

      db.coinBox.findFirst.mockResolvedValue(mockCoinBox)
      db.house.findFirst.mockResolvedValue(mockHouse)

      const input = {
        houseId: 1,
        assignedAt: new Date()
      }

      await expect(assignCoinBox(1, input, 1, '127.0.0.1')).rejects.toThrow('Rumah harus aktif')
    })
  })

  describe('listCoinBoxes', () => {
    it('should return list of coin boxes with active assignments', async () => {
      const mockCoinBoxes = [
        {
          ...createMockCoinBox({ id: 1, boxNumber: 'KNU-001' }),
          assignments: [{
            id: 1,
            coinBoxId: 1,
            houseId: 1,
            status: 'ACTIVE' as const,
            house: createMockHouse({ id: 1, name: 'House 1' })
          }]
        },
        {
          ...createMockCoinBox({ id: 2, boxNumber: 'KNU-002' }),
          assignments: []
        }
      ]

      db.coinBox.findMany.mockResolvedValue(mockCoinBoxes)

      const result = await listCoinBoxes()

      expect(result).toHaveLength(2)
      expect(result[0].boxNumber).toBe('KNU-001')
      expect(result[0].assignments).toHaveLength(1)
    })
  })
})
