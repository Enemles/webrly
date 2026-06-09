
import React from 'react'
import FunnelsDataTable from './data-table'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import BlurPage from '@/components/global/blur-page'
import CreateFunnelForm from '@/components/forms/create-funnel-form'
import { getFunnels } from '@/lib/services/funnel'

const Funnels = async (props: { params: Promise<{ subaccountId: string }> }) => {
  const params = await props.params;
  const funnels = await getFunnels(params.subaccountId)
  if (!funnels) return null

  return (
    <BlurPage>
      <FunnelsDataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Create Funnel
          </>
        }
        modalChildren={
          <CreateFunnelForm subAccountId={params.subaccountId}></CreateFunnelForm>
        }
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  )
}

export default Funnels
