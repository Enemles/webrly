import BlurPage from "@/components/global/blur-page";
import Sidebar from "@/components/sidebar/sidebarServer";
import Unauthorized from "@/components/unauthorized";
import { verifyAndAcceptInvitation } from "@/lib/services/auth";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: {
    agencyId: string;
  }
}

const layout = async ({ children, params }: Props) => {

  const agencyId = await verifyAndAcceptInvitation()
  const user = await currentUser();

  if (!user) {
    return redirect('/sign')
  }

  if (!agencyId) {
    return redirect('/agency')
  }

  if (user.privateMetadata.role !== 'AGENCY_OWNER' && user.privateMetadata.role !== 'AGENCY_ADMIN')
    return <Unauthorized />

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