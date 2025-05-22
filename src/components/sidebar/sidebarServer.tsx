// src/components/layout/SidebarServer.tsx
import { getAuthUserDetails } from "@/lib/services/auth";
import SidebarClient from "./sidebarClient";        // ↙︎ à créer
import type { AgencySidebarOption, SubAccountSidebarOption, SubAccount, Agency } from "@prisma/client";
import { getNotificationAndUser } from "@/lib/services/notification";
import { NotificationWithUser } from "@/lib/types";

type Props = { id: string; type: "agency" | "subaccount" };

const SidebarServer = async ({ id, type }: Props) => {
  // 1. Auth
  const user = await getAuthUserDetails();
  if (!user || !user.Agency) return null;

  // 2. Quelle entité est « active »
  const details =
    type === "agency"
      ? user.Agency
      : user.Agency.SubAccount.find((sa) => sa.id === id);

  if (!details) return null;

  // 3. Logo
  const isWhiteLabeled = user.Agency.whiteLabel;
  let logo = user.Agency.agencyLogo || "/assets/logo.svg";
  if (!isWhiteLabeled && type === "subaccount") {
    logo =
      user.Agency.SubAccount.find((sa) => sa.id === id)?.subAccountLogo ||
      logo;
  }

  // 4. Options de menu + sous-comptes autorisés
  const sidebarOpt:
    | AgencySidebarOption[]
    | SubAccountSidebarOption[] =
    type === "agency"
      ? user.Agency.SidebarOption ?? []
      : user.Agency.SubAccount.find((sa) => sa.id === id)?.SidebarOption ?? [];

  const subAccounts: SubAccount[] = user.Agency.SubAccount.filter((sa) =>
    user.Permissions.find((p) => p.subAccountId === sa.id && p.access)
  );

  // 5. Récupérer les notifications
  const allNotifications = await getNotificationAndUser(user.Agency.id);
  let notifications = allNotifications;

  // Filtrer les notifications pour les sous-comptes si nécessaire
  if (type === "subaccount" && 
      user.role !== 'AGENCY_ADMIN' && 
      user.role !== 'AGENCY_OWNER' && 
      allNotifications) {
    notifications = allNotifications.filter(
      (item) => item.subAccountId === id
    );
  }

  // 6. Passe tout au client
  return (
    <SidebarClient
      logo={logo}
      sidebarOpt={sidebarOpt}
      subAccounts={subAccounts}
      details={details}
      user={user}
      notifications={notifications}
      subAccountId={type === "subaccount" ? id : undefined}
    />
  );
};

export default SidebarServer;
