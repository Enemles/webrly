import Unauthorized from '@/components/unauthorized'
import { verifyAndAcceptInvitation } from '@/lib/services/auth'
import { getAuthUserDetails } from '@/lib/services/auth'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: Promise<{
    state: string,
    code: string,
  }>
}

const Page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const agencyId = await verifyAndAcceptInvitation()

  if (!agencyId) {
    return <Unauthorized />
  }

  const user = await getAuthUserDetails()

  if (!user) return

  const getFirstSubaccountWithAccess = user.Permissions.find((permission) => permission.access === true)

  if (searchParams.state) {
    const statePath = searchParams.state.split('___')[0]
    const stateSubaccountId = searchParams.state.split('___')[1]
    if (!stateSubaccountId) return <Unauthorized />
    return redirect(`/subaccount/${stateSubaccountId}/${statePath}?code=${searchParams.code}`)
  }

  if (getFirstSubaccountWithAccess) {
    return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`)
  }

  return <Unauthorized />
}

export default Page
