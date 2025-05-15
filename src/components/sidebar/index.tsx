import { getAuthUserDetails } from "@/lib/services/auth";
import { permission } from "process";
import React from "react";
import MenuOptions from "./MenuOptions";

type Props = {
  id: string;
  type: 'agency' | 'subaccount';
}

const Sidebar = async ({ id, type }: Props) => {

  const user = await getAuthUserDetails();
  if (!user) return null;
  if (!user.Agency) return;

  const details = type === 'agency' ? user?.Agency : user?.Agency.SubAccount.find((subaccount) => subaccount.id === id);

  const isWhiteLabeledAgency = user.Agency.whiteLabel;

  if (!details) return

  let sideBarLogo = user.Agency.agencyLogo || '/assets/logo.svg'

  if (!isWhiteLabeledAgency) {
    if (type === 'subaccount') {
      sideBarLogo = user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.subAccountLogo || user.Agency.agencyLogo
    }
  }

  const sibeBarOpt = type === 'agency' ? user.Agency.SidebarOption || [] : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.SidebarOption || []

  const subAccounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find((permission) =>
      permission.subAccountId === subaccount.id && permission.access
    ))


  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sibeBarOpt}
        subAccounts={subAccounts}
        user={user}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sibeBarOpt}
        subAccounts={subAccounts}
        user={user}
      />
    </>
  );
}

export default Sidebar;