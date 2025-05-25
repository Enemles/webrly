// src/components/layout/SidebarClient.tsx
"use client";

import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { icons } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Button } from "../ui/button";
import { Bell, ChevronsUpDown, PlusCircleIcon } from "lucide-react";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "../global/CustomModal";
import SubAccountDetails from "../forms/subaccount-details";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { NotificationWithUser } from "@/lib/types";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "../global/mode-toggle";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "../ui/sheet";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Props = {
  logo: string;
  sidebarOpt: any[];
  subAccounts: any[];
  details: any;
  user: any;
  notifications: NotificationWithUser;
  subAccountId?: string;
};

// Composant de notification séparé, indépendant de la sidebar
export function NotificationButton({ 
  notifications, 
  role, 
  subAccountId 
}: {
  notifications: NotificationWithUser;
  role?: string;
  subAccountId?: string;
}) {
  const [showAll, setShowAll] = useState(true);
  const [allNotifications, setAllNotifications] = useState(notifications);

  const handleClick = () => {
    if (!showAll) {
      setAllNotifications(notifications);
    } else {
      if (notifications?.length !== 0) {
        setAllNotifications(
          notifications?.filter((item) => item.subAccountId === subAccountId) ?? []
        );
      }
    }
    setShowAll((prev) => !prev);
  };
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <Sheet>
        <SheetTrigger>
          <div className="rounded-full w-9 h-9 bg-background flex items-center justify-center text-neutral-700 dark:text-neutral-200 shadow-md hover:shadow-lg transition-shadow">
            <Bell size={17} />
          </div>
        </SheetTrigger>
        <SheetContent className="pr-4 overflow-scroll">
          <SheetHeader className="text-left">
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>
              {(role === 'AGENCY_ADMIN' || role === 'AGENCY_OWNER') && (
                <Card className="flex items-center justify-between p-4">
                  Sous-compte actuel
                  <Switch onCheckedChange={handleClick} />
                </Card>
              )}
            </SheetDescription>
          </SheetHeader>
          {allNotifications?.map((notification) => (
            <div
              key={notification.id}
              className="flex flex-col gap-y-2 mb-2 overflow-x-scroll text-ellipsis"
            >
              <div className="flex gap-2">
                <Avatar>
                  <AvatarImage
                    src={notification.User.avatarUrl}
                    alt="Photo de profil"
                  />
                  <AvatarFallback className="bg-primary">
                    {notification.User.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p>
                    <span className="font-bold">
                      {notification.notification.split('|')[0]}
                    </span>
                    <span className="text-muted-foreground">
                      {notification.notification.split('|')[1]}
                    </span>
                    <span className="font-bold">
                      {notification.notification.split('|')[2]}
                    </span>
                  </p>
                  <small className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
          {allNotifications?.length === 0 && (
            <div className="flex items-center justify-center text-muted-foreground mb-4">
              Vous n&apos;avez pas de notifications
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function SidebarClient({
  logo,
  sidebarOpt,
  subAccounts,
  details,
  user,
  notifications,
  subAccountId,
}: Props) {
  const [open, setOpen] = useState(false);
  const { setOpen: openModal } = useModal();
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Préchargement des images pour éviter les délais lors du survol
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Précharger le logo principal
      const mainLogo = new window.Image();
      mainLogo.src = logo;

      // Précharger les logos des sous-comptes
      const logoSources = [
        details.agencyLogo || logo,
        details.subAccountLogo || logo,
        ...subAccounts.map(sa => sa.subAccountLogo)
      ].filter(Boolean);

      // Précharger les images en parallèle
      Promise.all(
        logoSources.map(src => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
          });
        })
      ).then(() => {
        setImagesPreloaded(true);
      });
    }
  }, [logo, details, subAccounts]);

  /* ---------- Helpers ---------- */
  const links = sidebarOpt.map((opt) => {
    const result = icons.find((i) => i.value === opt.icon);
    const Icon = result ? result.path : () => <span className="h-5 w-5" />;
    return {
      label: opt.name,
      href: opt.link,
      icon: <Icon />,
    };
  });

  /* ---------- Render ---------- */
  return (
    <>
      {/* Bouton de notification rendu en dehors de la sidebar */}
      <NotificationButton 
        notifications={notifications} 
        role={user.role} 
        subAccountId={subAccountId}
      />
      
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-8">
          {/* ====== TOP : Logo + sélecteur d'agence/sous-compte ====== */}
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Sélecteur agency / subaccount (reprend ton Popover+Command) */}
            <div className={open ? "mt-4" : "mt-2"}>
              <AccountSwitcher
                details={details}
                subAccounts={subAccounts}
                user={user}
                onNavigate={() => setOpen(false)} // referme la sidebar sur mobile
                isSidebarOpen={open}
                logo={logo}
                imagesPreloaded={imagesPreloaded}
              />
            </div>

            {/* ====== Liens ====== */}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((lk) => (
                <SidebarLink key={lk.href} link={lk} />
              ))}
            </div>
          </div>

          {/* ====== FOOTER : Profil et Mode Toggle ====== */}
          <div className="flex items-center justify-between pt-4 pb-2 w-full">
            <div className={cn("flex flex-col items-center gap-3", !open ? "mx-auto" : "")}>
              <UserButton afterSignOutUrl="/" />
              <ModeToggle />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </>
  );

  /* ---------- Sous-composant AccountSwitcher ---------- */
  function AccountSwitcher({
    details,
    subAccounts,
    user,
    onNavigate,
    isSidebarOpen,
    logo,
    imagesPreloaded
  }: {
    details: any;
    subAccounts: any[];
    user: any;
    onNavigate: () => void;
    isSidebarOpen: boolean;
    logo: string;
    imagesPreloaded: boolean;
  }) {
    const [openPopover, setOpenPopover] = useState(false);
    const currentLogo = details.agencyLogo || details.subAccountLogo || logo;

    return (
      <div className="relative">
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-between",
                !isSidebarOpen ? "px-0" : "px-4 h-auto py-3"
              )}
            >
              <div className={cn("flex items-center", !isSidebarOpen ? "justify-center w-full" : "justify-start gap-3")}>
                {/* Logo toujours affiché, que la sidebar soit ouverte ou fermée */}
                <div className={cn("relative", !isSidebarOpen ? "w-8 h-8" : "w-10 h-10")}>
                  <Image
                    src={currentLogo}
                    alt="Logo compte"
                    width={isSidebarOpen ? 40 : 32}
                    height={isSidebarOpen ? 40 : 32}
                    className="rounded-md object-contain"
                    priority
                  />
                </div>
                
                {/* Nom et adresse affichés uniquement si la sidebar est ouverte */}
                {isSidebarOpen && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {details.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {details.address || 'Aucune adresse'}
                    </span>
                  </div>
                )}
                
                {isSidebarOpen && (
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 mt-1">
            <Command className="rounded-lg">
              <CommandInput placeholder="Rechercher des comptes..." />
              <CommandList>
                <CommandEmpty>Aucun résultat trouvé</CommandEmpty>

                {(user.role === "AGENCY_OWNER" || user.role === "AGENCY_ADMIN") && (
                  <CommandGroup heading="Agence">
                    <CommandItem className="my-1">
                      <Link
                        href={`/agency/${user.Agency.id}`}
                        onClick={() => {
                          onNavigate();
                          setOpenPopover(false);
                        }}
                        className="flex items-center gap-2 w-full"
                      >
                        <Image
                          src={user.Agency.agencyLogo}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded-md object-contain"
                          priority
                        />
                        <div className="flex flex-col">
                          <span>{user.Agency.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.Agency.address || 'Aucune adresse'}
                          </span>
                        </div>
                      </Link>
                    </CommandItem>
                  </CommandGroup>
                )}

                <CommandGroup heading="Comptes">
                  {subAccounts.map((sa) => (
                    <CommandItem key={sa.id} className="my-1">
                      <Link
                        href={`/subaccount/${sa.id}`}
                        onClick={() => {
                          onNavigate();
                          setOpenPopover(false);
                        }}
                        className="flex items-center gap-2 w-full"
                      >
                        <Image
                          src={sa.subAccountLogo}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded-md object-contain"
                        />
                        <div className="flex flex-col">
                          <span>{sa.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {sa.address || 'Aucune adresse'}
                          </span>
                        </div>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>

              {(user.role === "AGENCY_OWNER" || user.role === "AGENCY_ADMIN") && (
                <Button
                  className="w-full flex gap-2 mt-2"
                  onClick={() => {
                    setOpenPopover(false);
                    openModal(
                      <CustomModal
                        title="Créer un sous-compte"
                        subHeading="Basculez entre votre agence et les sous-comptes depuis la barre latérale"
                      >
                        <SubAccountDetails
                          agencyDetails={user.Agency as any}
                          userId={user.id}
                          userName={user.name}
                        />
                      </CustomModal>
                    );
                  }}
                >
                  <PlusCircleIcon size={15} /> Créer un sous-compte
                </Button>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
}
