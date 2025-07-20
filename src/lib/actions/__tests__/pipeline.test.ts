import { describe, it, expect, beforeEach } from 'vitest'
import { 
  deletePipelineAction, 
  updatePipelineAction, 
  updateAgencyGoalAction 
} from '../pipeline'
import { 
  mockPrisma, 
  createMockPipeline, 
  createMockAgency,
  mockRevalidatePath,
  mockNotificationService,
  resetAllMocks 
} from '@/test/mocks'

describe('Pipeline Actions', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('deletePipelineAction', () => {
    it('devrait supprimer un pipeline existant', async () => {
      // Arrange
      const pipelineId = 'pipeline-1'
      const mockPipelineData = createMockPipeline({ 
        id: pipelineId, 
        subAccountId: 'sub-1' 
      })
      
      mockPrisma.pipeline.findUnique.mockResolvedValue(mockPipelineData)
      mockPrisma.pipeline.delete.mockResolvedValue(mockPipelineData)

      // Act
      await deletePipelineAction(pipelineId)

      // Assert
      expect(mockPrisma.pipeline.findUnique).toHaveBeenCalledWith({
        where: { id: pipelineId },
        select: { subAccountId: true }
      })
      expect(mockPrisma.pipeline.delete).toHaveBeenCalledWith({
        where: { id: pipelineId }
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/subaccount/sub-1/pipelines')
    })

    it('devrait lever une erreur si le pipeline n\'existe pas', async () => {
      // Arrange
      const pipelineId = 'nonexistent-pipeline'
      mockPrisma.pipeline.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(deletePipelineAction(pipelineId)).rejects.toThrow('Pipeline non trouvé')
      expect(mockPrisma.pipeline.delete).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const pipelineId = 'pipeline-1'
      const mockPipelineData = createMockPipeline({ 
        id: pipelineId, 
        subAccountId: 'sub-1' 
      })
      
      mockPrisma.pipeline.findUnique.mockResolvedValue(mockPipelineData)
      mockPrisma.pipeline.delete.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(deletePipelineAction(pipelineId)).rejects.toThrow('Database error')
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('updatePipelineAction', () => {
    it('devrait mettre à jour un pipeline existant', async () => {
      // Arrange
      const pipelineId = 'pipeline-1'
      const updateData = { name: 'Pipeline mis à jour' }
      const mockPipelineData = createMockPipeline({ 
        id: pipelineId, 
        subAccountId: 'sub-1' 
      })
      const updatedPipeline = { ...mockPipelineData, ...updateData }
      
      mockPrisma.pipeline.findUnique.mockResolvedValue(mockPipelineData)
      mockPrisma.pipeline.update.mockResolvedValue(updatedPipeline)

      // Act
      const result = await updatePipelineAction(pipelineId, updateData)

      // Assert
      expect(mockPrisma.pipeline.findUnique).toHaveBeenCalledWith({
        where: { id: pipelineId },
        select: { subAccountId: true }
      })
      expect(mockPrisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: pipelineId },
        data: updateData
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/subaccount/sub-1/pipelines')
      expect(result).toEqual(updatedPipeline)
    })

    it('devrait lever une erreur si le pipeline n\'existe pas', async () => {
      // Arrange
      const pipelineId = 'nonexistent-pipeline'
      const updateData = { name: 'Nouveau nom' }
      mockPrisma.pipeline.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(updatePipelineAction(pipelineId, updateData)).rejects.toThrow('Pipeline non trouvé')
      expect(mockPrisma.pipeline.update).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('devrait permettre la mise à jour partielle', async () => {
      // Arrange
      const pipelineId = 'pipeline-1'
      const updateData = {} // Pas de données à mettre à jour
      const mockPipelineData = createMockPipeline({ 
        id: pipelineId, 
        subAccountId: 'sub-1' 
      })
      
      mockPrisma.pipeline.findUnique.mockResolvedValue(mockPipelineData)
      mockPrisma.pipeline.update.mockResolvedValue(mockPipelineData)

      // Act
      const result = await updatePipelineAction(pipelineId, updateData)

      // Assert
      expect(mockPrisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: pipelineId },
        data: {}
      })
      expect(result).toEqual(mockPipelineData)
    })
  })

  describe('updateAgencyGoalAction', () => {
    it('devrait mettre à jour le goal d\'une agence', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const newGoal = 10
      const mockAgencyData = createMockAgency({ 
        id: agencyId, 
        goal: 5 
      })
      const updatedAgency = { ...mockAgencyData, goal: newGoal }
      
      mockPrisma.agency.update.mockResolvedValue(updatedAgency)
      mockNotificationService.saveActivityLogsNotification.mockResolvedValue({})

      // Act
      const result = await updateAgencyGoalAction(agencyId, newGoal)

      // Assert
      expect(mockPrisma.agency.update).toHaveBeenCalledWith({
        where: { id: agencyId },
        data: { goal: newGoal }
      })
      expect(mockNotificationService.saveActivityLogsNotification).toHaveBeenCalledWith({
        agencyId,
        description: 'Updated the agency goal to | 10 Sub Account',
        subaccountId: undefined,
      })
      expect(mockRevalidatePath).toHaveBeenCalledTimes(3)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/agency/agency-1')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/agency/agency-1/settings')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/agency')
      expect(result).toEqual(updatedAgency)
    })

    it('devrait gérer les goals négatifs', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const newGoal = -5
      const mockAgencyData = createMockAgency({ 
        id: agencyId, 
        goal: 5 
      })
      const updatedAgency = { ...mockAgencyData, goal: newGoal }
      
      mockPrisma.agency.update.mockResolvedValue(updatedAgency)
      mockNotificationService.saveActivityLogsNotification.mockResolvedValue({})

      // Act
      const result = await updateAgencyGoalAction(agencyId, newGoal)

      // Assert
      expect(result.goal).toBe(newGoal)
      expect(mockNotificationService.saveActivityLogsNotification).toHaveBeenCalledWith({
        agencyId,
        description: 'Updated the agency goal to | -5 Sub Account',
        subaccountId: undefined,
      })
    })

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const newGoal = 10
      
      mockPrisma.agency.update.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(updateAgencyGoalAction(agencyId, newGoal)).rejects.toThrow('Database error')
      expect(mockNotificationService.saveActivityLogsNotification).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('devrait continuer même si la notification échoue', async () => {
      // Arrange
      const agencyId = 'agency-1'
      const newGoal = 10
      const mockAgencyData = createMockAgency({ 
        id: agencyId, 
        goal: 5 
      })
      const updatedAgency = { ...mockAgencyData, goal: newGoal }
      
      mockPrisma.agency.update.mockResolvedValue(updatedAgency)
      mockNotificationService.saveActivityLogsNotification.mockRejectedValue(
        new Error('Notification failed')
      )

      // Act & Assert
      await expect(updateAgencyGoalAction(agencyId, newGoal)).rejects.toThrow('Notification failed')
    })
  })
}) 