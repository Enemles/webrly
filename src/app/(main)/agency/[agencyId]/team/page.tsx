import React from 'react'
import DataTable from './data-table'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import SendInvitation from '@/components/forms/send-invitation'
import { getAuthUserGroup } from '@/lib/services/auth'
import { getAgencyDetails } from '@/lib/services/agency'

type Props = {
  params: Promise<{ agencyId: string }>
}

const TeamPage = async (props: Props) => {
  const params = await props.params;
  // Le layout gère déjà l'auth, plus besoin de vérifications redondantes
  const teamMembers = await getAuthUserGroup(params.agencyId)
  const agencyDetails = await getAgencyDetails(params.agencyId)

  if (!teamMembers || !agencyDetails) {
    throw new Error('Impossible de charger les données de l\'équipe')
  }

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
    />
  )
}

export default TeamPage
