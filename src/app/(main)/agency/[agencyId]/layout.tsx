import BlurPage from "@/components/global/blur-page";
import Sidebar from "@/components/sidebar/sidebarServer";
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import React from "react";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    agencyId: string;
  }>
}

const layout = async (props: Props) => {
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
  })
  if (!user) return redirect('/sign-in')

  if (user.role !== 'AGENCY_OWNER' && user.role !== 'AGENCY_ADMIN') {
    return redirect('/unauthorized')
  }

  if (user.agencyId !== params.agencyId) {
    return redirect('/unauthorized')
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.agencyId} type="agency" />
      <div className="md:pl-[60px]">
        <div className="relative">
          <BlurPage>
            {children}
          </BlurPage>
        </div>
      </div>
    </div>
  );
}

export default layout;