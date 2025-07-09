import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  getPipelineDetails,
  getLanesWithTicketsAndTags,
  upsertPipeline,
  deletePipeline,
  updateLanesOrder,
  updateTicketOrder,
  upsertLane,
  deleteLane,
  getTicketsWithTags,
  upsertTicket,
  deleteTicket,
  upsertTag,
  getTagsForSubaccount,
  deleteTag,
  getPipelines
} from '../index'
import { 
  mockPrisma, 
  createMockPipeline,
  createMockLane,
  createMockTicket,
  createMockTag,
  createMockUser,
  createMockContact,
  resetAllMocks 
} from '@/test/mocks'

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123')
}))

// Mock convertDecimalToNumber function
vi.mock('@/lib/utils', () => ({
  convertDecimalToNumber: vi.fn((data) => data)
}))

describe('Pipeline Service', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('getPipelineDetails', () => {
    it('devrait récupérer les détails d\'un pipeline', async () => {
      // Arrange
      const pipelineId = 'pipeline-123'
      const pipelineDetails = createMockPipeline({ id: pipelineId })
      
      mockPrisma.pipeline.findUnique.mockResolvedValue(pipelineDetails)

      // Act
      const result = await getPipelineDetails(pipelineId)

      // Assert
      expect(mockPrisma.pipeline.findUnique).toHaveBeenCalledWith({
        where: { id: pipelineId }
      })
      expect(result).toEqual(pipelineDetails)
    })

    it('devrait retourner null si le pipeline n\'existe pas', async () => {
      // Arrange
      const pipelineId = 'inexistant-pipeline'
      mockPrisma.pipeline.findUnique.mockResolvedValue(null)

      // Act
      const result = await getPipelineDetails(pipelineId)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('getLanesWithTicketsAndTags', () => {
    it('devrait récupérer toutes les lanes avec tickets et tags', async () => {
      // Arrange
      const pipelineId = 'pipeline-123'
      const mockLanes = [
        {
          ...createMockLane({ id: 'lane-1', order: 0 }),
          Tickets: [
            {
              ...createMockTicket({ id: 'ticket-1', order: 0 }),
              Tags: [createMockTag({ id: 'tag-1' })],
              Assigned: createMockUser({ id: 'user-1' }),
              Customer: createMockContact({ id: 'contact-1' })
            }
          ]
        },
        {
          ...createMockLane({ id: 'lane-2', order: 1 }),
          Tickets: []
        }
      ]
      
      mockPrisma.lane.findMany.mockResolvedValue(mockLanes)

      // Act
      const result = await getLanesWithTicketsAndTags(pipelineId)

      // Assert
      expect(mockPrisma.lane.findMany).toHaveBeenCalledWith({
        where: { pipelineId },
        orderBy: { order: 'asc' },
        include: {
          Tickets: {
            orderBy: { order: 'asc' },
            include: {
              Tags: true,
              Assigned: true,
              Customer: true
            }
          }
        }
      })
      expect(result).toEqual(mockLanes)
    })
  })

  describe('upsertPipeline', () => {
    it('devrait créer un nouveau pipeline', async () => {
      // Arrange
      const pipelineData = {
        name: 'New Pipeline',
        subAccountId: 'sub-123'
      }
      const createdPipeline = createMockPipeline({
        id: 'test-uuid-123',
        ...pipelineData
      })
      
      mockPrisma.pipeline.upsert.mockResolvedValue(createdPipeline)

      // Act
      const result = await upsertPipeline(pipelineData)

      // Assert
      expect(mockPrisma.pipeline.upsert).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
        update: pipelineData,
        create: pipelineData
      })
      expect(result).toEqual(createdPipeline)
    })

    it('devrait mettre à jour un pipeline existant', async () => {
      // Arrange
      const pipelineData = {
        id: 'existing-pipeline',
        name: 'Updated Pipeline',
        subAccountId: 'sub-123'
      }
      const updatedPipeline = createMockPipeline(pipelineData)
      
      mockPrisma.pipeline.upsert.mockResolvedValue(updatedPipeline)

      // Act
      const result = await upsertPipeline(pipelineData)

      // Assert
      expect(mockPrisma.pipeline.upsert).toHaveBeenCalledWith({
        where: { id: 'existing-pipeline' },
        update: pipelineData,
        create: pipelineData
      })
      expect(result).toEqual(updatedPipeline)
    })
  })

  describe('deletePipeline', () => {
    it('devrait supprimer un pipeline', async () => {
      // Arrange
      const pipelineId = 'pipeline-to-delete'
      const deletedPipeline = createMockPipeline({ id: pipelineId })
      
      mockPrisma.pipeline.delete.mockResolvedValue(deletedPipeline)

      // Act
      const result = await deletePipeline(pipelineId)

      // Assert
      expect(mockPrisma.pipeline.delete).toHaveBeenCalledWith({
        where: { id: pipelineId }
      })
      expect(result).toEqual(deletedPipeline)
    })
  })

  describe('updateLanesOrder', () => {
    it('devrait mettre à jour l\'ordre des lanes avec transaction', async () => {
      // Arrange
      const lanes = [
        createMockLane({ id: 'lane-1', order: 0 }),
        createMockLane({ id: 'lane-2', order: 1 }),
        createMockLane({ id: 'lane-3', order: 2 })
      ]
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      mockPrisma.$transaction.mockResolvedValue([])

      // Act
      await updateLanesOrder(lanes)

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith('Lanes order updated')
      
      consoleLogSpy.mockRestore()
    })

    it('devrait gérer les erreurs de mise à jour', async () => {
      // Arrange
      const lanes = [createMockLane({ id: 'lane-1', order: 0 })]
      const error = new Error('Transaction failed')
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockPrisma.$transaction.mockRejectedValue(error)

      // Act & Assert
      await expect(updateLanesOrder(lanes)).rejects.toThrow('Failed to update lanes order')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating lanes order:', error)
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('updateTicketOrder', () => {
    it('devrait mettre à jour l\'ordre des tickets avec transaction', async () => {
      // Arrange
      const tickets = [
        createMockTicket({ id: 'ticket-1', order: 0, laneId: 'lane-1' }),
        createMockTicket({ id: 'ticket-2', order: 1, laneId: 'lane-1' })
      ]
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      mockPrisma.$transaction.mockResolvedValue([])

      // Act
      await updateTicketOrder(tickets)

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith('Tickets order updated')
      
      consoleLogSpy.mockRestore()
    })

    it('devrait gérer les erreurs de mise à jour des tickets', async () => {
      // Arrange
      const tickets = [createMockTicket({ id: 'ticket-1' })]
      const error = new Error('Transaction failed')
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockPrisma.$transaction.mockRejectedValue(error)

      // Act & Assert
      await expect(updateTicketOrder(tickets)).rejects.toThrow('Failed to update tickets order')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating tickets order:', error)
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('upsertLane', () => {
    it('devrait créer une nouvelle lane avec ordre automatique', async () => {
      // Arrange
      const laneData = {
        name: 'New Lane',
        pipelineId: 'pipeline-123',
        color: '#FF0000'
      }
      const existingLanes = [
        createMockLane({ order: 0 }),
        createMockLane({ order: 1 })
      ]
      const createdLane = createMockLane({
        id: 'test-uuid-123',
        ...laneData,
        order: 2
      })
      
      mockPrisma.lane.findMany.mockResolvedValue(existingLanes)
      mockPrisma.lane.upsert.mockResolvedValue(createdLane)

      // Act
      const result = await upsertLane(laneData)

      // Assert
      expect(mockPrisma.lane.findMany).toHaveBeenCalledWith({
        where: { pipelineId: laneData.pipelineId }
      })
      expect(mockPrisma.lane.upsert).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
        update: laneData,
        create: {
          ...laneData,
          order: 2
        }
      })
      expect(result).toEqual(createdLane)
    })

    it('devrait utiliser l\'ordre spécifié lors de la mise à jour', async () => {
      // Arrange
      const laneData = {
        id: 'existing-lane',
        name: 'Updated Lane',
        pipelineId: 'pipeline-123',
        order: 5
      }
      const updatedLane = createMockLane(laneData)
      
      mockPrisma.lane.upsert.mockResolvedValue(updatedLane)

      // Act
      const result = await upsertLane(laneData)

      // Assert
      expect(mockPrisma.lane.findMany).not.toHaveBeenCalled()
      expect(mockPrisma.lane.upsert).toHaveBeenCalledWith({
        where: { id: 'existing-lane' },
        update: laneData,
        create: {
          ...laneData,
          order: 5
        }
      })
      expect(result).toEqual(updatedLane)
    })
  })

  describe('deleteLane', () => {
    it('devrait supprimer une lane', async () => {
      // Arrange
      const laneId = 'lane-to-delete'
      const deletedLane = createMockLane({ id: laneId })
      
      mockPrisma.lane.delete.mockResolvedValue(deletedLane)

      // Act
      const result = await deleteLane(laneId)

      // Assert
      expect(mockPrisma.lane.delete).toHaveBeenCalledWith({
        where: { id: laneId }
      })
      expect(result).toEqual(deletedLane)
    })
  })

  describe('getTicketsWithTags', () => {
    it('devrait récupérer tous les tickets d\'un pipeline avec tags', async () => {
      // Arrange
      const pipelineId = 'pipeline-123'
      const mockTickets = [
        {
          ...createMockTicket({ id: 'ticket-1' }),
          Tags: [createMockTag({ id: 'tag-1' })],
          Assigned: createMockUser({ id: 'user-1' }),
          Customer: createMockContact({ id: 'contact-1' })
        }
      ]
      
      mockPrisma.ticket.findMany.mockResolvedValue(mockTickets)

      // Act
      const result = await getTicketsWithTags(pipelineId)

      // Assert
      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        where: {
          Lane: { pipelineId }
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true
        }
      })
      expect(result).toEqual(mockTickets)
    })
  })

  describe('upsertTicket', () => {
    it('devrait créer un nouveau ticket avec ordre automatique', async () => {
      // Arrange
      const ticketData = {
        name: 'New Ticket',
        laneId: 'lane-123',
        value: 1000
      }
      const tags = [createMockTag({ id: 'tag-1' })]
      const existingTickets = [
        createMockTicket({ order: 0 }),
        createMockTicket({ order: 1 })
      ]
      const createdTicket = {
        ...createMockTicket({
          id: 'test-uuid-123',
          ...ticketData,
          order: 2
        }),
        Tags: tags,
        Assigned: createMockUser(),
        Customer: createMockContact(),
        Lane: createMockLane()
      }
      
      mockPrisma.ticket.findMany.mockResolvedValue(existingTickets)
      mockPrisma.ticket.upsert.mockResolvedValue(createdTicket)

      // Act
      const result = await upsertTicket(ticketData, tags)

      // Assert
      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        where: { laneId: ticketData.laneId }
      })
      expect(mockPrisma.ticket.upsert).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
        update: { ...ticketData, Tags: { set: tags } },
        create: { ...ticketData, Tags: { connect: tags }, order: 2 },
        include: {
          Assigned: true,
          Customer: true,
          Tags: true,
          Lane: true
        }
      })
      expect(result).toEqual(createdTicket)
    })

    it('devrait mettre à jour un ticket existant', async () => {
      // Arrange
      const ticketData = {
        id: 'existing-ticket',
        name: 'Updated Ticket',
        laneId: 'lane-123',
        order: 3
      }
      const tags = [createMockTag({ id: 'tag-1' })]
      const updatedTicket = {
        ...createMockTicket(ticketData),
        Tags: tags,
        Assigned: null,
        Customer: null,
        Lane: createMockLane()
      }
      
      mockPrisma.ticket.upsert.mockResolvedValue(updatedTicket)

      // Act
      const result = await upsertTicket(ticketData, tags)

      // Assert
      expect(mockPrisma.ticket.findMany).not.toHaveBeenCalled()
      expect(mockPrisma.ticket.upsert).toHaveBeenCalledWith({
        where: { id: 'existing-ticket' },
        update: { ...ticketData, Tags: { set: tags } },
        create: { ...ticketData, Tags: { connect: tags }, order: 3 },
        include: {
          Assigned: true,
          Customer: true,
          Tags: true,
          Lane: true
        }
      })
      expect(result).toEqual(updatedTicket)
    })
  })

  describe('deleteTicket', () => {
    it('devrait supprimer un ticket', async () => {
      // Arrange
      const ticketId = 'ticket-to-delete'
      const deletedTicket = createMockTicket({ id: ticketId })
      
      mockPrisma.ticket.delete.mockResolvedValue(deletedTicket)

      // Act
      const result = await deleteTicket(ticketId)

      // Assert
      expect(mockPrisma.ticket.delete).toHaveBeenCalledWith({
        where: { id: ticketId }
      })
      expect(result).toEqual(deletedTicket)
    })
  })

  describe('upsertTag', () => {
    it('devrait créer un nouveau tag', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const tagData = {
        name: 'New Tag',
        color: '#FF0000'
      }
      const createdTag = createMockTag({
        id: 'test-uuid-123',
        ...tagData,
        subAccountId: subaccountId
      })
      
      mockPrisma.tag.upsert.mockResolvedValue(createdTag)

      // Act
      const result = await upsertTag(subaccountId, tagData)

      // Assert
      expect(mockPrisma.tag.upsert).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123', subAccountId: subaccountId },
        update: tagData,
        create: { ...tagData, subAccountId: subaccountId }
      })
      expect(result).toEqual(createdTag)
    })

    it('devrait mettre à jour un tag existant', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const tagData = {
        id: 'existing-tag',
        name: 'Updated Tag',
        color: '#00FF00'
      }
      const updatedTag = createMockTag(tagData)
      
      mockPrisma.tag.upsert.mockResolvedValue(updatedTag)

      // Act
      const result = await upsertTag(subaccountId, tagData)

      // Assert
      expect(mockPrisma.tag.upsert).toHaveBeenCalledWith({
        where: { id: 'existing-tag', subAccountId: subaccountId },
        update: tagData,
        create: { ...tagData, subAccountId: subaccountId }
      })
      expect(result).toEqual(updatedTag)
    })
  })

  describe('getTagsForSubaccount', () => {
    it('devrait récupérer tous les tags d\'un subaccount', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const mockTags = [
        createMockTag({ id: 'tag-1', name: 'Tag 1' }),
        createMockTag({ id: 'tag-2', name: 'Tag 2' })
      ]
      
      mockPrisma.subAccount.findUnique.mockResolvedValue({
        Tags: mockTags
      })

      // Act
      const result = await getTagsForSubaccount(subaccountId)

      // Assert
      expect(mockPrisma.subAccount.findUnique).toHaveBeenCalledWith({
        where: { id: subaccountId },
        select: { Tags: true }
      })
      expect(result).toEqual({ Tags: mockTags })
    })
  })

  describe('deleteTag', () => {
    it('devrait supprimer un tag', async () => {
      // Arrange
      const tagId = 'tag-to-delete'
      const deletedTag = createMockTag({ id: tagId })
      
      mockPrisma.tag.delete.mockResolvedValue(deletedTag)

      // Act
      const result = await deleteTag(tagId)

      // Assert
      expect(mockPrisma.tag.delete).toHaveBeenCalledWith({
        where: { id: tagId }
      })
      expect(result).toEqual(deletedTag)
    })
  })

  describe('getPipelines', () => {
    it('devrait récupérer tous les pipelines d\'un subaccount', async () => {
      // Arrange
      const subaccountId = 'sub-123'
      const mockPipelines = [
        createMockPipeline({ id: 'pipeline-1', name: 'Pipeline 1' }),
        createMockPipeline({ id: 'pipeline-2', name: 'Pipeline 2' })
      ]
      
      mockPrisma.pipeline.findMany.mockResolvedValue(mockPipelines)

      // Act
      const result = await getPipelines(subaccountId)

      // Assert
      expect(mockPrisma.pipeline.findMany).toHaveBeenCalledWith({
        where: { subAccountId: subaccountId },
        include: {
          Lane: {
            include: {
              Tickets: true
            }
          }
        }
      })
      expect(result).toEqual(mockPipelines)
    })

    it('devrait retourner un tableau vide si aucun pipeline', async () => {
      // Arrange
      const subaccountId = 'sub-empty'
      mockPrisma.pipeline.findMany.mockResolvedValue([])

      // Act
      const result = await getPipelines(subaccountId)

      // Assert
      expect(result).toEqual([])
    })
  })
}) 