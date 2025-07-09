import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  upsertSubAccount,
  getSubaccountDetails,
  deleteSubAccount,
  getSubAccountsTeamMembers
} from '../index'
import { 
  mockPrisma, 
  createMockSubAccount,
  createMockUser,
  resetAllMocks 
} from '@/test/mocks'

// Mock uuid pour avoir des IDs prévisibles
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-permission-id-123')
}))

describe('SubAccount Service', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('upsertSubAccount', () => {
    it('devrait créer un nouveau subaccount avec toutes les configurations', async () => {
      // Arrange
      const subAccountData = createMockSubAccount({
        id: 'new-sub-123',
        name: 'New SubAccount',
        companyEmail: 'test@subaccount.com',
        agencyId: 'agency-123'
      })
      const agencyOwner = createMockUser({
        id: 'owner-1',
        email: 'owner@agency.com',
        role: 'AGENCY_OWNER'
      })
      const createdSubAccount = {
        ...subAccountData,
        Permissions: [{
          id: 'test-permission-id-123',
          access: true,
          email: agencyOwner.email
        }],
        Pipeline: [{
          name: 'Lead Cycle'
        }],
        SidebarOption: [
          { name: 'Dashboard', icon: 'category', link: `/subaccount/${subAccountData.id}` },
          { name: 'Launchpad', icon: 'clipboardIcon', link: `/subaccount/${subAccountData.id}/launchpad` },
          // ... autres options
        ]
      }
      
      mockPrisma.user.findFirst.mockResolvedValue(agencyOwner)
      mockPrisma.subAccount.upsert.mockResolvedValue(createdSubAccount)

      // Act
      const result = await upsertSubAccount(subAccountData)

      // Assert
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          Agency: { id: subAccountData.agencyId },
          role: 'AGENCY_OWNER'
        }
      })
      expect(mockPrisma.subAccount.upsert).toHaveBeenCalledWith({
        where: { id: subAccountData.id },
        update: subAccountData,
        create: {
          ...subAccountData,
          Permissions: {
            create: {
              access: true,
              email: agencyOwner.email,
              id: 'test-permission-id-123'
            },
            connect: {
              subAccountId: subAccountData.id,
              id: 'test-permission-id-123'
            }
          },
          Pipeline: {
            create: { name: 'Lead Cycle' }
          },
          SidebarOption: {
            create: expect.arrayContaining([
              expect.objectContaining({ name: 'Dashboard', icon: 'category' }),
              expect.objectContaining({ name: 'Launchpad', icon: 'clipboardIcon' }),
              expect.objectContaining({ name: 'Settings', icon: 'settings' }),
              expect.objectContaining({ name: 'Funnels', icon: 'pipelines' }),
              expect.objectContaining({ name: 'Media', icon: 'database' }),
              expect.objectContaining({ name: 'Pipelines', icon: 'flag' }),
              expect.objectContaining({ name: 'Contacts', icon: 'person' })
            ])
          }
        }
      })
      expect(result).toEqual(createdSubAccount)
    })

    it('devrait mettre à jour un subaccount existant', async () => {
      // Arrange
      const existingSubAccount = createMockSubAccount({
        id: 'existing-sub-123',
        name: 'Updated SubAccount',
        companyEmail: 'updated@subaccount.com'
      })
      const agencyOwner = createMockUser({ role: 'AGENCY_OWNER' })
      
      mockPrisma.user.findFirst.mockResolvedValue(agencyOwner)
      mockPrisma.subAccount.upsert.mockResolvedValue(existingSubAccount)

      // Act
      const result = await upsertSubAccount(existingSubAccount)

      // Assert
      expect(mockPrisma.subAccount.upsert).toHaveBeenCalledWith({
        where: { id: existingSubAccount.id },
        update: existingSubAccount,
        create: expect.any(Object)
      })
      expect(result).toBeTruthy()
      expect(result!.name).toBe('Updated SubAccount')
    })

    it('devrait retourner null si pas d\'email company', async () => {
      // Arrange
      const subAccountWithoutEmail = createMockSubAccount({
        companyEmail: '' // Email vide
      })

      // Act
      const result = await upsertSubAccount(subAccountWithoutEmail)

      // Assert
      expect(result).toBeNull()
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled()
    })

    it('devrait gérer l\'absence d\'owner d\'agence', async () => {
      // Arrange
      const subAccountData = createMockSubAccount({
        companyEmail: 'test@subaccount.com'
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      mockPrisma.user.findFirst.mockResolvedValue(null) // Pas d'owner trouvé

      // Act
      const result = await upsertSubAccount(subAccountData)

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith('Could not create subaccount')
      expect(mockPrisma.subAccount.upsert).not.toHaveBeenCalled()
      
      consoleLogSpy.mockRestore()
    })

    it('devrait correctement configurer tous les liens de sidebar', async () => {
      // Arrange
      const subAccountData = createMockSubAccount({
        id: 'sub-sidebar-test',
        companyEmail: 'test@sidebar.com'
      })
      const agencyOwner = createMockUser({ role: 'AGENCY_OWNER' })
      
      mockPrisma.user.findFirst.mockResolvedValue(agencyOwner)
      mockPrisma.subAccount.upsert.mockResolvedValue(subAccountData)

      // Act
      await upsertSubAccount(subAccountData)

      // Assert
      const createCall = mockPrisma.subAccount.upsert.mock.calls[0][0]
      const sidebarOptions = createCall.create.SidebarOption.create
      
      expect(sidebarOptions).toHaveLength(7)
      expect(sidebarOptions[0]).toEqual({
        name: 'Dashboard',
        icon: 'category',
        link: `/subaccount/${subAccountData.id}`
      })
      expect(sidebarOptions[1]).toEqual({
        name: 'Launchpad',
        icon: 'clipboardIcon',
        link: `/subaccount/${subAccountData.id}/launchpad`
      })
      expect(sidebarOptions[6]).toEqual({
        name: 'Contacts',
        icon: 'person',
        link: `/subaccount/${subAccountData.id}/contacts`
      })
    })
  })

  describe('getSubaccountDetails', () => {
    it('devrait récupérer les détails d\'un subaccount', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const subaccountDetails = createMockSubAccount({ id: subaccountId })
      
      mockPrisma.subAccount.findUnique.mockResolvedValue(subaccountDetails)

      // Act
      const result = await getSubaccountDetails(subaccountId)

      // Assert
      expect(mockPrisma.subAccount.findUnique).toHaveBeenCalledWith({
        where: { id: subaccountId }
      })
      expect(result).toEqual(subaccountDetails)
    })

    it('devrait retourner null si le subaccount n\'existe pas', async () => {
      // Arrange
      const subaccountId = 'inexistant-sub'
      mockPrisma.subAccount.findUnique.mockResolvedValue(null)

      // Act
      const result = await getSubaccountDetails(subaccountId)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('deleteSubAccount', () => {
    it('devrait supprimer un subaccount', async () => {
      // Arrange
      const subaccountId = 'sub-to-delete'
      const deletedSubAccount = createMockSubAccount({ id: subaccountId })
      
      mockPrisma.subAccount.delete.mockResolvedValue(deletedSubAccount)

      // Act
      const result = await deleteSubAccount(subaccountId)

      // Assert
      expect(mockPrisma.subAccount.delete).toHaveBeenCalledWith({
        where: { id: subaccountId }
      })
      expect(result).toEqual(deletedSubAccount)
    })

    it('devrait gérer les erreurs de suppression', async () => {
      // Arrange
      const subaccountId = 'sub-error'
      const deleteError = new Error('Cannot delete subaccount')
      
      mockPrisma.subAccount.delete.mockRejectedValue(deleteError)

      // Act & Assert
      await expect(deleteSubAccount(subaccountId)).rejects.toThrow('Cannot delete subaccount')
    })
  })

  describe('getSubAccountsTeamMembers', () => {
    it('devrait récupérer tous les membres d\'équipe d\'un subaccount', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const teamMembers = [
        createMockUser({
          id: 'user-1',
          name: 'Team Member 1',
          role: 'SUBACCOUNT_USER'
        }),
        createMockUser({
          id: 'user-2',
          name: 'Team Member 2',
          role: 'SUBACCOUNT_USER'
        })
      ]
      
      mockPrisma.user.findMany.mockResolvedValue(teamMembers)

      // Act
      const result = await getSubAccountsTeamMembers(subaccountId)

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          Agency: {
            SubAccount: {
              some: { id: subaccountId }
            }
          },
          role: 'SUBACCOUNT_USER',
          Permissions: {
            some: {
              subAccountId: subaccountId,
              access: true
            }
          }
        }
      })
      expect(result).toEqual(teamMembers)
      expect(result).toHaveLength(2)
    })

    it('devrait retourner un tableau vide si aucun membre d\'équipe', async () => {
      // Arrange
      const subaccountId = 'sub-empty'
      mockPrisma.user.findMany.mockResolvedValue([])

      // Act
      const result = await getSubAccountsTeamMembers(subaccountId)

      // Assert
      expect(result).toEqual([])
    })

    it('devrait filtrer correctement par rôle et permissions', async () => {
      // Arrange
      const subaccountId = 'sub-filter-test'
      const filteredUsers = [
        createMockUser({
          role: 'SUBACCOUNT_USER',
          // Cet utilisateur a accès au subaccount
        })
      ]
      
      mockPrisma.user.findMany.mockResolvedValue(filteredUsers)

      // Act
      await getSubAccountsTeamMembers(subaccountId)

      // Assert
      const queryCall = mockPrisma.user.findMany.mock.calls[0][0]
      expect(queryCall.where.role).toBe('SUBACCOUNT_USER')
      expect(queryCall.where.Permissions.some.access).toBe(true)
      expect(queryCall.where.Permissions.some.subAccountId).toBe(subaccountId)
    })
  })
}) 