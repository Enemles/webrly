import BlurPage from '@/components/global/blur-page'
import Sidebar from '@/components/sidebar/sidebarServer'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: Promise<{ subaccountId: string }>
}

const SubaccountLayout = async (props: Props) => {
  const params = await props.params;

  const {
    children
  } = props;

  const authUser = await currentUser()
  if (!authUser) return redirect('/sign-in')

  const user = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
    include: {
      Permissions: {
        include: {
          SubAccount: true,
        },
      },
    },
  })

  if (!user) return redirect('/sign-in')

  const hasPermission = user.Permissions.find(
    (permission) =>
      permission.access && permission.subAccountId === params.subaccountId
  )

  if (!hasPermission) return redirect('/unauthorized')

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
