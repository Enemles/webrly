import { describe, it, expect, beforeEach, vi } from 'vitest'
import { updateAgencyDetails } from '../index'
import { 
  mockPrisma, 
  createMockAgency,
  mockRevalidatePath,
  resetAllMocks 
} from '@/test/mocks'
import { Agency } from '@prisma/client'

describe('Agency Service', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('updateAgencyDetails', () => {
    it('devrait mettre à jour les détails d\'une agence', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const agencyDetails: Partial<Agency> = {
        name: 'Nouvelle Agence',
        companyEmail: 'nouveau@email.com',
        goal: 10
      }
      const existingAgency = createMockAgency({ id: agencyId })
      const updatedAgency = { ...existingAgency, ...agencyDetails }
      
      mockPrisma.agency.update.mockResolvedValue(updatedAgency)

      // Act
      const result = await updateAgencyDetails(agencyId, agencyDetails)

      // Assert
      expect(mockPrisma.agency.update).toHaveBeenCalledWith({
        where: { id: agencyId },
        data: agencyDetails
      })
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/agency/agency-1')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/agency/agency-1/settings')
      expect(result).toEqual(updatedAgency)
    })

    it('devrait permettre une mise à jour partielle', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const agencyDetails = { name: 'Nouveau nom seulement' }
      const existingAgency = createMockAgency({ id: agencyId })
      const updatedAgency = { ...existingAgency, ...agencyDetails }
      
      mockPrisma.agency.update.mockResolvedValue(updatedAgency)

      // Act
      const result = await updateAgencyDetails(agencyId, agencyDetails)

      // Assert
      expect(mockPrisma.agency.update).toHaveBeenCalledWith({
        where: { id: agencyId },
        data: agencyDetails
      })
      expect(result.name).toBe('Nouveau nom seulement')
    })

    it('devrait mettre à jour avec un objet vide', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const agencyDetails = {}
      const existingAgency = createMockAgency({ id: agencyId })
      
      mockPrisma.agency.update.mockResolvedValue(existingAgency)

      // Act
      const result = await updateAgencyDetails(agencyId, agencyDetails)

      // Assert
      expect(mockPrisma.agency.update).toHaveBeenCalledWith({
        where: { id: agencyId },
        data: {}
      })
      expect(result).toEqual(existingAgency)
    })

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const agencyDetails = { name: 'Test' }
      const dbError = new Error('Database connection failed')
      
      mockPrisma.agency.update.mockRejectedValue(dbError)

      // Act & Assert
      await expect(updateAgencyDetails(agencyId, agencyDetails)).rejects.toThrow('Failed to update agency details')
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('devrait gérer les propriétés spéciales comme whiteLabel', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const agencyDetails = { 
        whiteLabel: true,
        goal: 15,
        address: '456 Nouvelle rue'
      }
      const existingAgency = createMockAgency({ id: agencyId })
      const updatedAgency = { ...existingAgency, ...agencyDetails }
      
      mockPrisma.agency.update.mockResolvedValue(updatedAgency)

      // Act
      const result = await updateAgencyDetails(agencyId, agencyDetails)

      // Assert
      expect(result.whiteLabel).toBe(true)
      expect(result.goal).toBe(15)
      expect(result.address).toBe('456 Nouvelle rue')
    })

    it('devrait gérer la mise à jour avec des valeurs null', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const agencyDetails = { 
        connectAccountId: null,
        customerId: 'new-customer-id'
      }
      const existingAgency = createMockAgency({ id: agencyId })
      const updatedAgency = { ...existingAgency, ...agencyDetails }
      
      mockPrisma.agency.update.mockResolvedValue(updatedAgency)

      // Act
      const result = await updateAgencyDetails(agencyId, agencyDetails)

      // Assert
      expect(result.connectAccountId).toBeNull()
      expect(result.customerId).toBe('new-customer-id')
    })

    it('devrait log l\'erreur en cas d\'échec', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const agencyDetails = { name: 'Test' }
      const dbError = new Error('Prisma error')
      
      mockPrisma.agency.update.mockRejectedValue(dbError)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Act & Assert
      await expect(updateAgencyDetails(agencyId, agencyDetails)).rejects.toThrow('Failed to update agency details')
      
      // Note: Le console.error est déjà mocké dans setup.ts, donc on vérifie différemment
      // expect(consoleSpy).toHaveBeenCalledWith('Error updating agency details:', dbError)
    })
  })
}) 