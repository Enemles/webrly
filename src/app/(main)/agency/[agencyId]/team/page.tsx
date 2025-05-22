import { db } from '@/lib/db'
import React from 'react'
import DataTable from './data-table'
import { Plus } from 'lucide-react'
import { currentUser } from '@clerk/nextjs'
import { columns } from './columns'
import SendInvitation from '@/components/forms/send-invitation'
import { getAuthUserGroup } from '@/lib/services/auth'
import { redirect } from 'next/navigation'
import { getAgencyDetails } from '@/lib/services/agency'

type Props = {
  params: { agencyId: string }
}

const TeamPage = async ({ params }: Props) => {
  const { agencyId } = params
  const authUser = await currentUser()

  if (!authUser) redirect("/agency/sign-in");
  if (!agencyId) redirect("/agency/unauthorized");

  const teamMembers = await getAuthUserGroup(agencyId);
  if (!teamMembers) redirect("/agency/sign-in");

  const agencyDetails = await getAgencyDetails(agencyId);
  if (!agencyDetails) redirect("/agency/unauthorized");

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={agencyDetails.id} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    ></DataTable>
  )
}

export default TeamPage
