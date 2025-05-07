import { TableCell } from "@/components/ui/table"
import { TableBody } from "@/components/ui/table"
import BlurPage from "@/components/global/blur-page"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/db"
import { SubaccountWithContacts } from "@/lib/types"
import { Ticket } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns/format"
import { Badge } from "@/components/ui/badge"
import CreateContactButton from "./_components/create-contact-btn"

type Props = {
  params: { subaccountId: string }
}

const SubaccountContactPage = async ({ params }: Props) => {
  const contacts = await db.subAccount.findUnique({
    where: { id: params.subaccountId },
    include: {
      Contact: {
        include: {
          Ticket: {
            select: {
              value: true,
            }
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  }) as SubaccountWithContacts

  const allContacts = contacts.Contact

  const formatTotal = (tickets: Ticket[]) => {
    if (!tickets || !tickets.length) return '€0.00'
    const total = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
    })

    const laneAmounts = tickets.reduce(
      (acc, ticket) => acc + (Number(ticket?.value) || 0), 0
    )

    return total.format(laneAmounts)
  }

  return (
    <BlurPage>
      <h1 className="text-4xl p-4">Contacts</h1>
      <CreateContactButton subaccountId={params.subaccountId} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[300px]">Email</TableHead>
            <TableHead className="w-[200px]">Active</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage alt="@shadcn" />
                  <AvatarFallback className="bg-primary text-white">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {formatTotal(contact.Ticket) === '€0.00' ? (
                  <Badge variant={'destructive'}>Inactive</Badge>
                ) : (
                  <Badge className="bg-emerald-700">Active</Badge>
                )}
              </TableCell>
              <TableCell>{format(contact.createdAt, 'MM/dd/yyyy')}</TableCell>
              <TableCell className="text-right">
                {formatTotal(contact.Ticket)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BlurPage>
  )
}

export default SubaccountContactPage