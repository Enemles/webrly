import { PrismaClient } from '@prisma/client'

let prisma = new PrismaClient()

export const db = prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  prisma = db
}