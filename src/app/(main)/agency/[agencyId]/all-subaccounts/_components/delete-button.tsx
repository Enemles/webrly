'use client'
import { saveActivityLogsNotification } from '@/lib/services/notification'
import { useRouter } from 'next/navigation'
import React from 'react'
import { deleteSubAccount, getSubaccountDetails } from '@/lib/services/subaccount'
type Props = {
  subaccountId: string
}

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter()

  return (
    <div
      className="text-white"
      onClick={async () => {
        const response = await getSubaccountDetails(subaccountId)
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Deleted a subaccount | ${response?.name}`,
          subaccountId,
        })
        await deleteSubAccount(subaccountId)
        router.refresh()
      }}
    >
      Delete Sub Account
    </div>
  )
}

export default DeleteButton
