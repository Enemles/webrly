'use client'
import LaneForm from "@/components/forms/lane-form"
import CustomModal from "@/components/global/CustomModal"
import { Button } from "@/components/ui/button"
import { LaneDetail, PipelineDetailsWithLanesCardsTagsTickets, TicketAndTags } from "@/lib/types"
import { useModal } from "@/providers/modal-provider"
import { Lane, Ticket } from "@prisma/client"
import { Flag, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd"
import LaneCard from "./lane-card"

type Props = {
  lanes: LaneDetail[]
  pipelineId: string
  subaccountId: string
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets
  updateLanesOrder: (lanes: Lane[]) => Promise<void>
  updateTicketOrder: (tickets: Ticket[]) => Promise<void>
}

const PipelineView = ({ lanes, pipelineId, subaccountId, pipelineDetails, updateLanesOrder, updateTicketOrder }: Props) => {
  const { setOpen } = useModal()
  const router = useRouter()
  const [allLanes, setAllLanes] = useState<LaneDetail[]>(lanes)

  useEffect(() => {
    setAllLanes(lanes)
  }, [lanes])

  const handleAddLane = () => {
    setOpen(<CustomModal
      title="Create Lane"
      subHeading="Lanes allow you to group tickets together"
    >
      <LaneForm pipelineId={pipelineId} />
    </CustomModal>
    )
  }

  const ticketsFromAllLanes: TicketAndTags[] = []
  lanes.forEach((item) => {
    item.Tickets.forEach((ticket) => {
      ticketsFromAllLanes.push(ticket)
    })
  })

  const [allTickets, setAllTickets] = useState(ticketsFromAllLanes)

  const onDragEnd = (dropResult: DropResult) => {

    const { destination, source, type } = dropResult

    if (
      !destination ||
      destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    switch (type) {
      case 'lane': {
        const newLanes = [...allLanes]
          .toSpliced(source.index, 1)
          .toSpliced(destination.index, 0, allLanes[source.index])
          .map((lane, index) => {
            return { ...lane, order: index }
          })

        setAllLanes(newLanes)
        updateLanesOrder(newLanes)
      }

      case 'ticket':
        const newLanes = [...allLanes]
        const originLane = newLanes.find(
          (lane) => lane.id === source.droppableId
        )
        const destinationLane = newLanes.find(
          (lane) => lane.id === destination.droppableId
        )

        if (!originLane || !destinationLane) return

        if (source.droppableId === destination.droppableId) {
          const newOrderedTickets = [...originLane.Tickets]
            .toSpliced(source.index, 1)
            .toSpliced(destination.index, 0, originLane.Tickets[source.index])
            .map(
              (item, index) => {
                return { ...item, order: index }
              }
            )
          originLane.Tickets = newOrderedTickets
          setAllLanes(newLanes)
          updateTicketOrder(newOrderedTickets)
          router.refresh()
        }
        else {
          const [currentTicket] = originLane.Tickets.splice(source.index, 1)

          originLane.Tickets.forEach(
            (ticket, index) => {
              ticket.order = index
            })

          destinationLane.Tickets.splice(destination.index, 0, {
            ...currentTicket,
            laneId: destination.droppableId
          })

          destinationLane.Tickets.forEach(
            (ticket, index) => {
              ticket.order = index
            })

          setAllLanes(newLanes)
          updateTicketOrder([
            ...destinationLane.Tickets,
            ...originLane.Tickets
          ])
          router.refresh()
        }
    }
  }

  return <DragDropContext onDragEnd={onDragEnd}>
    <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{pipelineDetails?.name}</h1>
        <Button className="flex items-center gap-4" onClick={handleAddLane}>
          <Plus size={15} />
          Create Lane
        </Button>
      </div>
      <Droppable
        droppableId="lanes"
        type="lane"
        direction="horizontal"
        key="lanes"
      >
        {(provided) => (
          <div className="flex items-center gap-x-2 overflow-scroll" {...provided.droppableProps} ref={provided.innerRef}>
            <div className="flex mt-4">
              {allLanes.map((lane, index) => (
                <LaneCard
                  allTickets={allTickets}
                  setAllTickets={setAllTickets}
                  subaccountId={subaccountId}
                  pipelineId={pipelineId}
                  tickets={lane.Tickets}
                  laneDetails={lane}
                  index={index}
                  key={lane.id}
                />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
      {allLanes.length == 0 && <div className="flex items-center w-full flex-col">
        <div className="opacity-100">
          <Flag width={100} height={100} className="text-muted-foreground" />
        </div>
      </div>}
    </div>

  </DragDropContext>
}

export default PipelineView
