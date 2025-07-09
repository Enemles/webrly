import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  getAuthUserDetails, 
  initUser, 
  changeUserPermissions 
} from '../index'
import { 
  mockPrisma, 
  createMockUser,
  createMockAgency,
  mockCurrentUser,
  mockClerkClient,
  mockLoggedInUser,
  mockNoUser,
  resetAllMocks 
} from '@/test/mocks'

describe('Auth Service', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('getAuthUserDetails', () => {
    it('devrait retourner les détails d\'un utilisateur authentifié', async () => {
      // Arrange
      const mockUser = createMockUser({
        id: 'user-123',
        email: 'test@example.com',
        agencyId: 'agency-1'
      })
      const mockUserWithRelations = {
        ...mockUser,
        Agency: createMockAgency({ id: 'agency-1' }),
        Permissions: []
      }
      
      mockCurrentUser.mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'test@example.com' }]
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRelations)

      // Act
      const result = await getAuthUserDetails()

      // Assert
      expect(mockCurrentUser).toHaveBeenCalled()
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          Agency: {
            include: {
              SidebarOption: true,
              SubAccount: {
                include: {
                  SidebarOption: true,
                },
              },
            },
          },
          Permissions: true,
        }
      })
      expect(result).toEqual(mockUserWithRelations)
    })

    it('devrait retourner undefined si aucun utilisateur n\'est connecté', async () => {
      // Arrange
      mockNoUser()

      // Act
      const result = await getAuthUserDetails()

      // Assert
      expect(result).toBeUndefined()
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
    })

    it('devrait gérer les erreurs avec emailAddresses vides', async () => {
      // Arrange
      mockCurrentUser.mockResolvedValue({
        id: 'user-123',
        emailAddresses: []
      })

      // Act & Assert
      // Note: Cette fonction a un bug - elle ne gère pas les emailAddresses vides
      await expect(getAuthUserDetails()).rejects.toThrow()
    })
  })

  describe('initUser', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      // Arrange
      const newUserData = { role: 'AGENCY_ADMIN' as const }
      const clerkUser = mockLoggedInUser({
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
        imageUrl: 'https://example.com/avatar.jpg'
      })
      
      const createdUser = createMockUser({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'AGENCY_ADMIN'
      })
      
      mockPrisma.user.upsert.mockResolvedValue(createdUser)
      mockClerkClient.users.updateUserMetadata.mockResolvedValue({})

      // Act
      const result = await initUser(newUserData)

      // Assert
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        update: newUserData,
        create: {
          id: 'user-123',
          avatarUrl: 'https://example.com/avatar.jpg',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'AGENCY_ADMIN'
        }
      })
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith('user-123', {
        privateMetadata: { role: 'AGENCY_ADMIN' }
      })
      expect(result).toEqual(createdUser)
    })

    it('devrait gérer un utilisateur sans prénom/nom', async () => {
      // Arrange
      const newUserData = { role: 'SUBACCOUNT_USER' as const }
      mockLoggedInUser({
        id: 'user-123',
        firstName: null,
        lastName: null,
        emailAddresses: [{ emailAddress: 'user@example.com' }]
      })
      
      const createdUser = createMockUser({
        id: 'user-123',
        name: 'user',
        email: 'user@example.com',
        role: 'SUBACCOUNT_USER'
      })
      
      mockPrisma.user.upsert.mockResolvedValue(createdUser)
      mockClerkClient.users.updateUserMetadata.mockResolvedValue({})

      // Act
      const result = await initUser(newUserData)

      // Assert
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
        update: newUserData,
        create: expect.objectContaining({
          name: 'user'
        })
      })
    })

    it('devrait retourner null si aucun utilisateur n\'est connecté', async () => {
      // Arrange
      mockNoUser()

      // Act
      const result = await initUser({ role: 'SUBACCOUNT_USER' })

      // Assert
      expect(result).toBeNull()
      expect(mockPrisma.user.upsert).not.toHaveBeenCalled()
    })

    it('devrait utiliser un rôle par défaut', async () => {
      // Arrange
      mockLoggedInUser({
        emailAddresses: [{ emailAddress: 'test@example.com' }]
      })
      
      const createdUser = createMockUser({ role: 'SUBACCOUNT_USER' })
      mockPrisma.user.upsert.mockResolvedValue(createdUser)
      mockClerkClient.users.updateUserMetadata.mockResolvedValue({})

      // Act
      await initUser({})

      // Assert
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: expect.any(Object),
        update: {},
        create: expect.objectContaining({
          role: 'SUBACCOUNT_USER'
        })
      })
    })
  })

  describe('changeUserPermissions', () => {
    it('devrait mettre à jour une permission existante avec permissionId', async () => {
      // Arrange
      const permissionId = 'perm-123'
      const userEmail = 'user@example.com'
      const subAccountId = 'sub-123'
      const permission = true
      
      const existingPermission = {
        id: permissionId,
        email: userEmail,
        subAccountId,
        access: false
      }
      const updatedPermission = { ...existingPermission, access: true }
      
      mockPrisma.permissions.findUnique.mockResolvedValue(existingPermission)
      mockPrisma.permissions.findFirst.mockResolvedValue(null)
      mockPrisma.permissions.update.mockResolvedValue(updatedPermission)

      // Act
      const result = await changeUserPermissions(permissionId, userEmail, subAccountId, permission)

      // Assert
      expect(mockPrisma.permissions.update).toHaveBeenCalledWith({
        where: { id: permissionId },
        data: { access: true }
      })
      expect(result).toEqual(updatedPermission)
    })

    it('devrait mettre à jour une permission existante par email/subAccountId', async () => {
      // Arrange
      const permissionId = undefined
      const userEmail = 'user@example.com'
      const subAccountId = 'sub-123'
      const permission = true
      
      const existingPermissionByEmail = {
        id: 'perm-456',
        email: userEmail,
        subAccountId,
        access: false
      }
      const updatedPermission = { ...existingPermissionByEmail, access: true }
      
      mockPrisma.permissions.findFirst.mockResolvedValue(existingPermissionByEmail)
      mockPrisma.permissions.update.mockResolvedValue(updatedPermission)

      // Act
      const result = await changeUserPermissions(permissionId, userEmail, subAccountId, permission)

      // Assert
      expect(mockPrisma.permissions.findFirst).toHaveBeenCalledWith({
        where: {
          email: userEmail,
          subAccountId: subAccountId
        }
      })
      expect(mockPrisma.permissions.update).toHaveBeenCalledWith({
        where: { id: 'perm-456' },
        data: { access: true }
      })
      expect(result).toEqual(updatedPermission)
    })

    it('devrait créer une nouvelle permission si aucune n\'existe', async () => {
      // Arrange
      const permissionId = undefined
      const userEmail = 'newuser@example.com'
      const subAccountId = 'sub-123'
      const permission = true
      
      const newPermission = {
        id: 'perm-new',
        email: userEmail,
        subAccountId,
        access: true
      }
      
      mockPrisma.permissions.findFirst.mockResolvedValue(null)
      mockPrisma.permissions.create.mockResolvedValue(newPermission)

      // Act
      const result = await changeUserPermissions(permissionId, userEmail, subAccountId, permission)

      // Assert
      expect(mockPrisma.permissions.create).toHaveBeenCalledWith({
        data: {
          access: true,
          email: userEmail,
          subAccountId: subAccountId
        }
      })
      expect(result).toEqual(newPermission)
    })

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const permissionId = 'perm-123'
      const userEmail = 'user@example.com'
      const subAccountId = 'sub-123'
      const permission = true
      
      const dbError = new Error('Database error')
      mockPrisma.permissions.findUnique.mockRejectedValue(dbError)

      // Act & Assert
      await expect(
        changeUserPermissions(permissionId, userEmail, subAccountId, permission)
      ).rejects.toThrow('Database error')
    })
  })
}) 