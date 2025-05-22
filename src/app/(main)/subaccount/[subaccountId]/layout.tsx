import BlurPage from '@/components/global/blur-page'
import Sidebar from '@/components/sidebar/sidebarServer'
import Unauthorized from '@/components/unauthorized'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/services/auth'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: { subaccountId: string }
}

const SubaccountLayout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation()
  if (!agencyId) return <Unauthorized />
  const user = await currentUser()
  if (!user) {
    return redirect('/')
  }

  if (!user.privateMetadata.role) {
    return <Unauthorized />
  } else {
    const allPermissions = await getAuthUserDetails()
    const hasPermission = allPermissions?.Permissions.find(
      (permissions) =>
        permissions.access && permissions.subAccountId === params.subaccountId
    )
    if (!hasPermission) {
      return <Unauthorized />
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        id={params.subaccountId}
        type="subaccount"
      />

      <div className="md:pl-[60px]">
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SubaccountLayout
