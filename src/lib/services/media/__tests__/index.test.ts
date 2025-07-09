import { describe, it, expect, beforeEach } from 'vitest'
import { getMedia, createMedia, deleteMedia } from '../index'
import { 
  mockPrisma, 
  createMockSubAccount,
  createMockMedia,
  resetAllMocks 
} from '@/test/mocks'

describe('Media Service', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('getMedia', () => {
    it('devrait récupérer tous les médias d\'un subaccount', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const mockSubaccountWithMedia = {
        ...createMockSubAccount({ id: subaccountId }),
        Media: [
          createMockMedia({ id: 'media-1', name: 'image1.jpg' }),
          createMockMedia({ id: 'media-2', name: 'image2.png' })
        ]
      }
      
      mockPrisma.subAccount.findUnique.mockResolvedValue(mockSubaccountWithMedia)

      // Act
      const result = await getMedia(subaccountId)

      // Assert
      expect(mockPrisma.subAccount.findUnique).toHaveBeenCalledWith({
        where: { id: subaccountId },
        include: { Media: true }
      })
      expect(result).toEqual(mockSubaccountWithMedia)
      expect(result?.Media).toHaveLength(2)
    })

    it('devrait retourner null si le subaccount n\'existe pas', async () => {
      // Arrange
      const subaccountId = 'inexistant-sub'
      mockPrisma.subAccount.findUnique.mockResolvedValue(null)

      // Act
      const result = await getMedia(subaccountId)

      // Assert
      expect(result).toBeNull()
      expect(mockPrisma.subAccount.findUnique).toHaveBeenCalledWith({
        where: { id: subaccountId },
        include: { Media: true }
      })
    })

    it('devrait retourner un subaccount sans médias', async () => {
      // Arrange
      const subaccountId = 'sub-empty'
      const mockSubaccountEmpty = {
        ...createMockSubAccount({ id: subaccountId }),
        Media: []
      }
      
      mockPrisma.subAccount.findUnique.mockResolvedValue(mockSubaccountEmpty)

      // Act
      const result = await getMedia(subaccountId)

      // Assert
      expect(result?.Media).toHaveLength(0)
    })
  })

  describe('createMedia', () => {
    it('devrait créer un nouveau média', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const mediaFile = {
        name: 'test-image.jpg',
        link: 'https://example.com/test-image.jpg'
      }
      const createdMedia = createMockMedia({
        id: 'media-new',
        name: mediaFile.name,
        link: mediaFile.link,
        subAccountId: subaccountId
      })
      
      mockPrisma.media.create.mockResolvedValue(createdMedia)

      // Act
      const result = await createMedia(subaccountId, mediaFile)

      // Assert
      expect(mockPrisma.media.create).toHaveBeenCalledWith({
        data: {
          link: mediaFile.link,
          name: mediaFile.name,
          subAccountId: subaccountId,
        }
      })
      expect(result).toEqual(createdMedia)
    })

    it('devrait créer un média avec type spécifique', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const mediaFile = {
        name: 'video.mp4',
        link: 'https://example.com/video.mp4'
      }
      const createdMedia = createMockMedia({
        name: mediaFile.name,
        link: mediaFile.link,
        type: 'video/mp4',
        subAccountId: subaccountId
      })
      
      mockPrisma.media.create.mockResolvedValue(createdMedia)

      // Act
      const result = await createMedia(subaccountId, mediaFile)

      // Assert
      expect(result.name).toBe(mediaFile.name)
      expect(result.link).toBe(mediaFile.link)
      expect(result.subAccountId).toBe(subaccountId)
    })

    it('devrait gérer les erreurs de création', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const mediaFile = {
        name: 'test.jpg',
        link: 'https://example.com/test.jpg'
      }
      const dbError = new Error('Erreur de base de données')
      
      mockPrisma.media.create.mockRejectedValue(dbError)

      // Act & Assert
      await expect(createMedia(subaccountId, mediaFile)).rejects.toThrow('Erreur de base de données')
    })
  })

  describe('deleteMedia', () => {
    it('devrait supprimer un média existant', async () => {
      // Arrange
      const mediaId = 'media-123'
      const deletedMedia = createMockMedia({ id: mediaId })
      
      mockPrisma.media.delete.mockResolvedValue(deletedMedia)

      // Act
      const result = await deleteMedia(mediaId)

      // Assert
      expect(mockPrisma.media.delete).toHaveBeenCalledWith({
        where: { id: mediaId }
      })
      expect(result).toEqual(deletedMedia)
    })

    it('devrait gérer la suppression d\'un média inexistant', async () => {
      // Arrange
      const mediaId = 'inexistant-media'
      const notFoundError = new Error('Media not found')
      
      mockPrisma.media.delete.mockRejectedValue(notFoundError)

      // Act & Assert
      await expect(deleteMedia(mediaId)).rejects.toThrow('Media not found')
    })

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const mediaId = 'media-123'
      const dbError = new Error('Database connection failed')
      
      mockPrisma.media.delete.mockRejectedValue(dbError)

      // Act & Assert
      await expect(deleteMedia(mediaId)).rejects.toThrow('Database connection failed')
    })
  })
}) 