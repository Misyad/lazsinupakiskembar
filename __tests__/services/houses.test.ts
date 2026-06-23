import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/src/lib/db/prisma'
import { createHouse, listHouses, updateHouse, deleteHouse } from '@/src/services/houses/service'
import { createMockHouse } from '../utils/test-helpers'

vi.mock('@/src/lib/db/prisma', async () => {
  const { mockPrismaClient } = await import('../utils/test-helpers')
  return { prisma: mockPrismaClient() }
})

const db = prisma as any

describe('Houses Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createHouse', () => {
    it('should create a house successfully', async () => {
      const mockHouse = createMockHouse({
        name: 'Keluarga Baru',
        address: 'Jl. Test No. 123',
        rtRw: 'RT01/RW02'
      })

      // Service resolves the area first, then creates the house.
      db.area.findFirst.mockResolvedValue({ id: 1, code: 'PAKISKEMBAR', name: 'Pakiskembar' })
      db.house.create.mockResolvedValue(mockHouse)

      const input = {
        areaId: 1,
        name: 'Keluarga Baru',
        phone: '081234567890',
        address: 'Jl. Test No. 123',
        rtRw: 'RT01/RW02',
        joinedAt: new Date('2026-05-01')
      }

      const result = await createHouse(input)

      expect(result).toBeDefined()
      expect(result.name).toBe('Keluarga Baru')
      expect(result.active).toBe(true)
      expect(db.house.create).toHaveBeenCalledOnce()
    })

    it('should set default joinedAt to current date if not provided', async () => {
      const mockHouse = createMockHouse()
      db.area.findFirst.mockResolvedValue({ id: 1, code: 'PAKISKEMBAR', name: 'Pakiskembar' })
      db.house.create.mockResolvedValue(mockHouse)

      const input = {
        areaId: 1,
        name: 'Test House',
        phone: undefined,
        address: 'Test Address',
        rtRw: 'RT01/RW02',
        joinedAt: undefined
      }

      await createHouse(input)

      expect(db.house.create).toHaveBeenCalled()
      // joinedAt defaults to a Date when not supplied.
      expect(db.house.create.mock.calls[0][0].data.joinedAt).toBeInstanceOf(Date)
    })
  })

  describe('listHouses', () => {
    it('should return list of active houses', async () => {
      const mockHouses = [
        createMockHouse({ id: 1, name: 'House 1' }),
        createMockHouse({ id: 2, name: 'House 2' }),
        createMockHouse({ id: 3, name: 'House 3' })
      ]

      db.house.findMany.mockResolvedValue(mockHouses)

      const result = await listHouses()

      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('House 1')
      expect(db.house.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' }
        })
      )
    })

    it('should return empty array when no houses exist', async () => {
      db.house.findMany.mockResolvedValue([])

      const result = await listHouses()

      expect(result).toHaveLength(0)
    })
  })

  describe('updateHouse', () => {
    it('should update house successfully', async () => {
      const existingHouse = createMockHouse({ id: 1, name: 'Old Name' })
      const updatedHouse = createMockHouse({ id: 1, name: 'New Name' })

      db.house.findFirst.mockResolvedValue(existingHouse)
      db.house.update.mockResolvedValue(updatedHouse)

      const input = {
        name: 'New Name',
        phone: '081234567890',
        address: 'New Address',
        rtRw: 'RT02/RW03'
      }

      const result = await updateHouse(1, input)

      expect(result).toBeDefined()
      expect(result.name).toBe('New Name')
      expect(db.house.update).toHaveBeenCalled()
    })

    it('should throw error if house not found', async () => {
      db.house.findFirst.mockResolvedValue(null)

      const input = {
        name: 'Test',
        phone: undefined,
        address: 'Test',
        rtRw: 'RT01/RW02'
      }

      await expect(updateHouse(999, input)).rejects.toThrow()
    })
  })

  describe('deleteHouse', () => {
    it('should soft delete house by setting deletedAt', async () => {
      const existingHouse = createMockHouse({ id: 1 })
      const deletedHouse = createMockHouse({ id: 1, deletedAt: new Date() })

      db.house.findFirst.mockResolvedValue(existingHouse)
      db.house.update.mockResolvedValue(deletedHouse)

      const result = await deleteHouse(1)

      expect(result).toBeDefined()
      expect(result.deletedAt).toBeDefined()
      expect(db.house.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date), active: false }
      })
    })

    it('should throw error if house not found', async () => {
      db.house.findFirst.mockResolvedValue(null)

      await expect(deleteHouse(999)).rejects.toThrow()
    })
  })
})
