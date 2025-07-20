import { describe, it, expect, beforeEach } from 'vitest'
import { searchContacts } from '../index'
import { 
  mockPrisma, 
  createMockContact,
  resetAllMocks 
} from '@/test/mocks'

describe('Contact Service', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('searchContacts', () => {
    it('devrait chercher des contacts par nom', async () => {
      // Arrange
      const searchTerms = 'John'
      const mockContacts = [
        createMockContact({ 
          id: 'contact-1', 
          name: 'John Doe',
          email: 'john@example.com'
        }),
        createMockContact({ 
          id: 'contact-2', 
          name: 'Johnny Smith',
          email: 'johnny@example.com'
        })
      ]
      
      mockPrisma.contact.findMany.mockResolvedValue(mockContacts)

      // Act
      const result = await searchContacts(searchTerms)

      // Assert
      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: searchTerms,
          }
        }
      })
      expect(result).toEqual(mockContacts)
      expect(result).toHaveLength(2)
    })

    it('devrait retourner un tableau vide si aucun contact trouvé', async () => {
      // Arrange
      const searchTerms = 'NonExistent'
      mockPrisma.contact.findMany.mockResolvedValue([])

      // Act
      const result = await searchContacts(searchTerms)

      // Assert
      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: searchTerms,
          }
        }
      })
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('devrait gérer les termes de recherche vides', async () => {
      // Arrange
      const searchTerms = ''
      const allContacts = [
        createMockContact({ id: 'contact-1' }),
        createMockContact({ id: 'contact-2' }),
        createMockContact({ id: 'contact-3' })
      ]
      
      mockPrisma.contact.findMany.mockResolvedValue(allContacts)

      // Act
      const result = await searchContacts(searchTerms)

      // Assert
      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: '',
          }
        }
      })
      expect(result).toEqual(allContacts)
      expect(result).toHaveLength(3)
    })

    it('devrait être insensible à la casse', async () => {
      // Arrange
      const searchTerms = 'jane'
      const mockContacts = [
        createMockContact({ 
          id: 'contact-1', 
          name: 'Jane Doe',
          email: 'jane@example.com'
        })
      ]
      
      mockPrisma.contact.findMany.mockResolvedValue(mockContacts)

      // Act
      const result = await searchContacts(searchTerms)

      // Assert
      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'jane',
          }
        }
      })
      expect(result).toEqual(mockContacts)
    })

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const searchTerms = 'test'
      const dbError = new Error('Database connection failed')
      
      mockPrisma.contact.findMany.mockRejectedValue(dbError)

      // Act & Assert
      await expect(searchContacts(searchTerms)).rejects.toThrow('Database connection failed')
    })

    it('devrait chercher des contacts avec des caractères spéciaux', async () => {
      // Arrange
      const searchTerms = "O'Connor"
      const mockContacts = [
        createMockContact({ 
          id: 'contact-1', 
          name: "Sarah O'Connor",
          email: 'sarah@example.com'
        })
      ]
      
      mockPrisma.contact.findMany.mockResolvedValue(mockContacts)

      // Act
      const result = await searchContacts(searchTerms)

      // Assert
      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: "O'Connor",
          }
        }
      })
      expect(result).toEqual(mockContacts)
    })

    it('devrait chercher des contacts avec des espaces', async () => {
      // Arrange
      const searchTerms = 'John Doe'
      const mockContacts = [
        createMockContact({ 
          id: 'contact-1', 
          name: 'John Doe',
          email: 'john.doe@example.com'
        })
      ]
      
      mockPrisma.contact.findMany.mockResolvedValue(mockContacts)

      // Act
      const result = await searchContacts(searchTerms)

      // Assert
      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John Doe',
          }
        }
      })
      expect(result).toEqual(mockContacts)
    })

    it('devrait retourner plusieurs contacts correspondants', async () => {
      // Arrange
      const searchTerms = 'Smith'
      const mockContacts = [
        createMockContact({ 
          id: 'contact-1', 
          name: 'John Smith',
          email: 'john.smith@example.com'
        }),
        createMockContact({ 
          id: 'contact-2', 
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }),
        createMockContact({ 
          id: 'contact-3', 
          name: 'Bob Smith Jr.',
          email: 'bob.smith@example.com'
        })
      ]
      
      mockPrisma.contact.findMany.mockResolvedValue(mockContacts)

      // Act
      const result = await searchContacts(searchTerms)

      // Assert
      expect(result).toHaveLength(3)
      expect(result.every(contact => contact.name.includes('Smith'))).toBe(true)
    })
  })
}) 