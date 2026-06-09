import AgencyDetails from '@/components/forms/agency-details';
import UserDetails from '@/components/forms/user-details';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
  params: {
    agencyId: string;
  }
}

const Settings = async ({ params }: Props) => {
  const authUser = await currentUser()
  if (!authUser) {
    redirect('/sign-in')
  }

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })

  if (!userDetails) {
    redirect('/sign-in')
  }

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId
    },
    include: {
      SubAccount: true
    }
  })

  if (!agencyDetails) {
    redirect('/agency')
  }

  // Vérification des permissions
  if (userDetails.agencyId !== params.agencyId) {
    redirect('/unauthorized')
  }

  const subAccounts = agencyDetails.SubAccount

  return (
    <div className="flex lg:!flex-row flex-col gap-4">
      Settings
      <AgencyDetails data={agencyDetails} />
      <UserDetails
        type="agency"
        id={params.agencyId}
        subAccounts={subAccounts}
        userData={userDetails} />
    </div>
  )
}

export default Settings
