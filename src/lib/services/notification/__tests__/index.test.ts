import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  mockPrisma, 
  createMockNotification,
  createMockUser,
  createMockSubAccount,
  mockCurrentUser,
  mockLoggedInUser,
  mockNoUser,
  createMockClerkUser,
  resetAllMocks 
} from '@/test/mocks'

// Import des vraies fonctions (pas mockées)
import { 
  getNotificationAndUser,
  saveActivityLogsNotification
} from '../index'

describe.skip('Notification Service', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('getNotificationAndUser', () => {
    it('devrait récupérer toutes les notifications d\'une agence avec les utilisateurs', async () => {
      // Arrange
      const agencyId = 'agency-123'
      const mockNotifications = [
        {
          ...createMockNotification({ 
            id: 'notif-1', 
            agencyId, 
            notification: 'Test notification 1' 
          }),
          User: createMockUser({ id: 'user-1', name: 'User 1' })
        },
        {
          ...createMockNotification({ 
            id: 'notif-2', 
            agencyId, 
            notification: 'Test notification 2' 
          }),
          User: createMockUser({ id: 'user-2', name: 'User 2' })
        }
      ]
      
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications)

      // Act
      const result = await getNotificationAndUser(agencyId)

      // Assert
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { agencyId },
        include: { User: true },
        orderBy: { createdAt: 'desc' }
      })
      expect(result).toEqual(mockNotifications)
    })

    it('devrait retourner un tableau vide si aucune notification', async () => {
      // Arrange
      const agencyId = 'agency-empty'
      mockPrisma.notification.findMany.mockResolvedValue([])

      // Act
      const result = await getNotificationAndUser(agencyId)

      // Assert
      expect(result).toEqual([])
    })

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const agencyId = 'agency-error'
      const dbError = new Error('Database error')
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      mockPrisma.notification.findMany.mockRejectedValue(dbError)

      // Act
      const result = await getNotificationAndUser(agencyId)

      // Assert
      expect(result).toBeUndefined()
      expect(consoleLogSpy).toHaveBeenCalledWith(dbError)
      
      consoleLogSpy.mockRestore()
    })
  })

  describe('saveActivityLogsNotification', () => {
    describe('avec utilisateur authentifié', () => {
      it('devrait créer une notification avec agencyId et subaccountId', async () => {
        // Arrange
        const agencyId = 'agency-123'
        const subaccountId = 'sub-123'
        const description = 'Test action performed'
        
        const clerkUser = createMockClerkUser({
          emailAddresses: [{ emailAddress: 'test@example.com' }]
        })
        const userData = createMockUser({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User'
        })
        
        mockCurrentUser.mockResolvedValue(clerkUser)
        mockPrisma.user.findUnique.mockResolvedValue(userData)
        mockPrisma.notification.create.mockResolvedValue(createMockNotification())

        // Act
        await saveActivityLogsNotification({ agencyId, description, subaccountId })

        // Assert
        expect(mockCurrentUser).toHaveBeenCalled()
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' }
        })
        expect(mockPrisma.notification.create).toHaveBeenCalledWith({
          data: {
            notification: `${userData.name} | ${description}`,
            User: { connect: { id: userData.id } },
            Agency: { connect: { id: agencyId } },
            SubAccount: { connect: { id: subaccountId } }
          }
        })
      })

      it('devrait créer une notification sans subaccountId', async () => {
        // Arrange
        const agencyId = 'agency-123'
        const description = 'Test action without subaccount'
        
        const clerkUser = createMockClerkUser({
          emailAddresses: [{ emailAddress: 'test@example.com' }]
        })
        const userData = createMockUser({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User'
        })
        
        mockCurrentUser.mockResolvedValue(clerkUser)
        mockPrisma.user.findUnique.mockResolvedValue(userData)
        mockPrisma.notification.create.mockResolvedValue(createMockNotification())

        // Act
        await saveActivityLogsNotification({ agencyId, description })

        // Assert
        expect(mockPrisma.notification.create).toHaveBeenCalledWith({
          data: {
            notification: `${userData.name} | ${description}`,
            User: { connect: { id: userData.id } },
            Agency: { connect: { id: agencyId } }
          }
        })
      })
    })

    describe('sans utilisateur authentifié', () => {
      it('devrait utiliser un utilisateur de l\'agence via subaccount', async () => {
        // Arrange
        const subaccountId = 'sub-123'
        const description = 'Test action from agency user'
        const userData = createMockUser({
          id: 'agency-user-123',
          name: 'Agency User'
        })
        
        mockNoUser()
        mockPrisma.user.findFirst.mockResolvedValue(userData)
        mockPrisma.subAccount.findUnique.mockResolvedValue(
          createMockSubAccount({ id: subaccountId, agencyId: 'agency-123' })
        )
        mockPrisma.notification.create.mockResolvedValue(createMockNotification())

        // Act
        await saveActivityLogsNotification({ description, subaccountId })

        // Assert
        expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
          where: {
            Agency: {
              SubAccount: {
                some: { id: subaccountId }
              }
            }
          }
        })
        expect(mockPrisma.subAccount.findUnique).toHaveBeenCalledWith({
          where: { id: subaccountId }
        })
        expect(mockPrisma.notification.create).toHaveBeenCalled()
      })

      it('devrait retourner early si aucun utilisateur trouvé', async () => {
        // Arrange
        const subaccountId = 'sub-123'
        const description = 'Test action'
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        mockNoUser()
        mockPrisma.user.findFirst.mockResolvedValue(null)

        // Act
        const result = await saveActivityLogsNotification({ description, subaccountId })

        // Assert
        expect(result).toBeUndefined()
        expect(consoleLogSpy).toHaveBeenCalledWith('Could not find a user')
        expect(mockPrisma.notification.create).not.toHaveBeenCalled()
        
        consoleLogSpy.mockRestore()
      })
    })

    describe('gestion des erreurs', () => {
      it('devrait lever une erreur si ni agencyId ni subaccountId fournis', async () => {
        // Arrange
        const description = 'Test action'
        const userData = createMockUser()
        mockLoggedInUser()
        mockPrisma.user.findUnique.mockResolvedValue(userData)

        // Act & Assert
        await expect(
          saveActivityLogsNotification({ description })
        ).rejects.toThrow('You need to provide atleast an agency Id or subaccount Id')
      })

      it('devrait récupérer l\'agencyId depuis le subaccount si pas fourni', async () => {
        // Arrange
        const subaccountId = 'sub-123'
        const description = 'Test action'
        const userData = createMockUser()
        const subAccount = createMockSubAccount({
          id: subaccountId,
          agencyId: 'agency-from-sub'
        })
        
        mockLoggedInUser()
        mockPrisma.user.findUnique.mockResolvedValue(userData)
        mockPrisma.subAccount.findUnique.mockResolvedValue(subAccount)
        mockPrisma.notification.create.mockResolvedValue(createMockNotification())

        // Act
        await saveActivityLogsNotification({ description, subaccountId })

        // Assert
        expect(mockPrisma.subAccount.findUnique).toHaveBeenCalledWith({
          where: { id: subaccountId }
        })
        expect(mockPrisma.notification.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            Agency: { connect: { id: 'agency-from-sub' } }
          })
        })
      })
    })

    describe('cas d\'utilisateur authentifié sans données', () => {
      it('devrait retourner early si l\'utilisateur authentifié n\'a pas de données', async () => {
        // Arrange
        const agencyId = 'agency-123'
        const description = 'Test action'
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        mockLoggedInUser()
        mockPrisma.user.findUnique.mockResolvedValue(null) // Pas de données utilisateur

        // Act
        const result = await saveActivityLogsNotification({ agencyId, description })

        // Assert
        expect(result).toBeUndefined()
        expect(consoleLogSpy).toHaveBeenCalledWith('Could not find a user')
        expect(mockPrisma.notification.create).not.toHaveBeenCalled()
        
        consoleLogSpy.mockRestore()
      })
    })
  })
}) 