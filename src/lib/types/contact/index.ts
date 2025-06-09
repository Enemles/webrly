import { Contact, SubAccount, Ticket } from '@prisma/client'

export type SubaccountWithContacts = SubAccount & {
  Contact: (Contact & { Ticket: Ticket[] })[]
} 