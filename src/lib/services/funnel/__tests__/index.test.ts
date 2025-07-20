import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  upsertFunnel,
  getFunnel,
  getFunnels,
  updateFunnelProducts,
  upsertFunnelPage,
  deleteFunnelePage,
  getFunnelPageDetails,
  getDomainContent
} from '../index'
import { 
  mockPrisma, 
  createMockFunnel,
  createMockFunnelPage,
  mockRevalidatePath,
  resetAllMocks 
} from '@/test/mocks'

// Mock uuid pour avoir des IDs prévisibles
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123')
}))

describe('Funnel Service', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('upsertFunnel', () => {
    it('devrait créer un nouveau funnel', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const funnelData = {
        name: 'Test Funnel',
        description: 'Test Description',
        published: false,
        liveProducts: '[]'
      }
      const funnelId = 'new-funnel'
      const createdFunnel = createMockFunnel({
        id: funnelId,
        ...funnelData,
        subAccountId: subaccountId
      })
      
      mockPrisma.funnel.upsert.mockResolvedValue(createdFunnel)

      // Act
      const result = await upsertFunnel(subaccountId, funnelData, funnelId)

      // Assert
      expect(mockPrisma.funnel.upsert).toHaveBeenCalledWith({
        where: { id: funnelId },
        update: funnelData,
        create: {
          ...funnelData,
          id: funnelId,
          subAccountId: subaccountId,
        }
      })
      expect(result).toEqual(createdFunnel)
    })

    it('devrait mettre à jour un funnel existant', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const funnelData = {
        name: 'Updated Funnel',
        description: 'Updated Description',
        published: true,
        liveProducts: '[{"id": "prod1"}]'
      }
      const funnelId = 'existing-funnel'
      const updatedFunnel = createMockFunnel({
        id: funnelId,
        ...funnelData
      })
      
      mockPrisma.funnel.upsert.mockResolvedValue(updatedFunnel)

      // Act
      const result = await upsertFunnel(subaccountId, funnelData, funnelId)

      // Assert
      expect(result.name).toBe(funnelData.name)
      expect(result.published).toBe(true)
    })

    it('devrait utiliser un UUID si aucun funnelId n\'est fourni', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const funnelData = {
        name: 'Test Funnel',
        description: 'Test Description',
        liveProducts: '[]'
      }
      const funnelId = ''
      const createdFunnel = createMockFunnel({
        id: 'test-uuid-123',
        ...funnelData
      })
      
      mockPrisma.funnel.upsert.mockResolvedValue(createdFunnel)

      // Act
      await upsertFunnel(subaccountId, funnelData, funnelId)

      // Assert
      expect(mockPrisma.funnel.upsert).toHaveBeenCalledWith({
        where: { id: funnelId },
        update: funnelData,
        create: {
          ...funnelData,
          id: 'test-uuid-123',
          subAccountId: subaccountId,
        }
      })
    })
  })

  describe('getFunnel', () => {
    it('devrait récupérer un funnel avec ses pages', async () => {
      // Arrange
      const funnelId = 'funnel-123'
      const mockFunnelWithPages = {
        ...createMockFunnel({ id: funnelId }),
        FunnelPages: [
          createMockFunnelPage({ id: 'page-1', order: 0 }),
          createMockFunnelPage({ id: 'page-2', order: 1 })
        ]
      }
      
      mockPrisma.funnel.findUnique.mockResolvedValue(mockFunnelWithPages)

      // Act
      const result = await getFunnel(funnelId)

      // Assert
      expect(mockPrisma.funnel.findUnique).toHaveBeenCalledWith({
        where: { id: funnelId },
        include: {
          FunnelPages: {
            orderBy: { order: 'asc' }
          }
        }
      })
      expect(result).toEqual(mockFunnelWithPages)
      expect(result?.FunnelPages).toHaveLength(2)
    })

    it('devrait retourner null si le funnel n\'existe pas', async () => {
      // Arrange
      const funnelId = 'inexistant-funnel'
      mockPrisma.funnel.findUnique.mockResolvedValue(null)

      // Act
      const result = await getFunnel(funnelId)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('getFunnels', () => {
    it('devrait récupérer tous les funnels d\'un subaccount', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const mockFunnels = [
        {
          ...createMockFunnel({ id: 'funnel-1', name: 'Funnel 1' }),
          FunnelPages: [createMockFunnelPage()]
        },
        {
          ...createMockFunnel({ id: 'funnel-2', name: 'Funnel 2' }),
          FunnelPages: []
        }
      ]
      
      mockPrisma.funnel.findMany.mockResolvedValue(mockFunnels)

      // Act
      const result = await getFunnels(subaccountId)

      // Assert
      expect(mockPrisma.funnel.findMany).toHaveBeenCalledWith({
        where: { subAccountId: subaccountId },
        include: { FunnelPages: true }
      })
      expect(result).toEqual(mockFunnels)
      expect(result).toHaveLength(2)
    })
  })

  describe('updateFunnelProducts', () => {
    it('devrait mettre à jour les produits d\'un funnel', async () => {
      // Arrange
      const funnelId = 'funnel-123'
      const products = '[{"id": "prod1", "name": "Product 1"}]'
      const updatedFunnel = createMockFunnel({
        id: funnelId,
        liveProducts: products
      })
      
      mockPrisma.funnel.update.mockResolvedValue(updatedFunnel)

      // Act
      const result = await updateFunnelProducts(products, funnelId)

      // Assert
      expect(mockPrisma.funnel.update).toHaveBeenCalledWith({
        where: { id: funnelId },
        data: { liveProducts: products }
      })
      expect(result.liveProducts).toBe(products)
    })
  })

  describe('upsertFunnelPage', () => {
    it('devrait créer une nouvelle page de funnel', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const funnelId = 'funnel-123'
      const funnelPageData = {
        id: '',
        name: 'New Page',
        pathName: '/new-page',
        order: 0
      }
      const createdPage = createMockFunnelPage({
        id: 'page-new',
        name: 'New Page',
        funnelId
      })
      
      mockPrisma.funnelPage.upsert.mockResolvedValue(createdPage)

      // Act
      const result = await upsertFunnelPage(subaccountId, funnelPageData, funnelId)

      // Assert
      expect(mockPrisma.funnelPage.upsert).toHaveBeenCalledWith({
        where: { id: '' },
        update: { ...funnelPageData },
        create: {
          ...funnelPageData,
          content: JSON.stringify([{
            content: [],
            id: '__body',
            name: 'Body',
            styles: { backgroundColor: 'white' },
            type: '__body',
          }]),
          funnelId
        }
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/subaccount/${subaccountId}/funnels/${funnelId}`,
        'page'
      )
      expect(result).toEqual(createdPage)
    })

    it('devrait utiliser le contenu existant lors de la mise à jour', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const funnelId = 'funnel-123'
      const existingContent = '[{"id": "custom", "type": "text"}]'
      const funnelPageData = {
        id: 'page-existing',
        name: 'Updated Page',
        pathName: '/updated-page',
        order: 0,
        content: existingContent
      }
      const updatedPage = createMockFunnelPage({
        ...funnelPageData,
        content: existingContent
      })
      
      mockPrisma.funnelPage.upsert.mockResolvedValue(updatedPage)

      // Act
      await upsertFunnelPage(subaccountId, funnelPageData, funnelId)

      // Assert
      expect(mockPrisma.funnelPage.upsert).toHaveBeenCalledWith({
        where: { id: 'page-existing' },
        update: { ...funnelPageData },
        create: {
          ...funnelPageData,
          content: existingContent,
          funnelId
        }
      })
    })

    it('ne devrait rien faire si subaccountId ou funnelId est manquant', async () => {
      // Act & Assert
      const result1 = await upsertFunnelPage('', { name: 'Test', pathName: '/test', order: 0 }, 'funnel-123')
      const result2 = await upsertFunnelPage('sub-123', { name: 'Test', pathName: '/test', order: 0 }, '')
      
      expect(result1).toBeUndefined()
      expect(result2).toBeUndefined()
      expect(mockPrisma.funnelPage.upsert).not.toHaveBeenCalled()
    })
  })

  describe('deleteFunnelePage', () => {
    it('devrait supprimer une page de funnel', async () => {
      // Arrange
      const funnelPageId = 'page-123'
      const deletedPage = createMockFunnelPage({ id: funnelPageId })
      
      mockPrisma.funnelPage.delete.mockResolvedValue(deletedPage)

      // Act
      const result = await deleteFunnelePage(funnelPageId)

      // Assert
      expect(mockPrisma.funnelPage.delete).toHaveBeenCalledWith({
        where: { id: funnelPageId }
      })
      expect(result).toEqual(deletedPage)
    })
  })

  describe('getFunnelPageDetails', () => {
    it('devrait récupérer les détails d\'une page de funnel', async () => {
      // Arrange
      const funnelPageId = 'page-123'
      const pageDetails = createMockFunnelPage({ id: funnelPageId })
      
      mockPrisma.funnelPage.findUnique.mockResolvedValue(pageDetails)

      // Act
      const result = await getFunnelPageDetails(funnelPageId)

      // Assert
      expect(mockPrisma.funnelPage.findUnique).toHaveBeenCalledWith({
        where: { id: funnelPageId }
      })
      expect(result).toEqual(pageDetails)
    })
  })

  describe('getDomainContent', () => {
    it('devrait récupérer le contenu par sous-domaine', async () => {
      // Arrange
      const subDomainName = 'test-funnel'
      const mockFunnelWithDomain = {
        ...createMockFunnel({ subDomainName }),
        FunnelPages: [
          createMockFunnelPage({ id: 'page-1' }),
          createMockFunnelPage({ id: 'page-2' })
        ]
      }
      
      mockPrisma.funnel.findUnique.mockResolvedValue(mockFunnelWithDomain)

      // Act
      const result = await getDomainContent(subDomainName)

      // Assert
      expect(mockPrisma.funnel.findUnique).toHaveBeenCalledWith({
        where: { subDomainName },
        include: { FunnelPages: true }
      })
      expect(result).toEqual(mockFunnelWithDomain)
    })

    it('devrait retourner null si le sous-domaine n\'existe pas', async () => {
      // Arrange
      const subDomainName = 'inexistant-domain'
      mockPrisma.funnel.findUnique.mockResolvedValue(null)

      // Act
      const result = await getDomainContent(subDomainName)

      // Assert
      expect(result).toBeNull()
    })
  })
}) 