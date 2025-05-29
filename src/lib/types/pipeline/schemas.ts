import { z } from 'zod'

export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1),
})

export const LaneFormSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1, 'Color is required'),
})

const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

export const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: 'Value must be a valid price.',
  }),
}) 