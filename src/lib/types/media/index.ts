import { Prisma } from '@prisma/client'
import { getMedia } from '../../services/media'

export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>

export type CreateMediaType = Prisma.MediaCreateWithoutSubaccountInput 