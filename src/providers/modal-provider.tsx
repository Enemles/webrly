'use client';

import { PricesList, TicketDetails, UserWithPermissionsAndSubAccounts } from "@/lib/types";
import { Agency, Contact, Plan, User } from "@prisma/client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}

export type ModalData = {
  user?: User;
  agencyId?: Agency;
  ticket?: TicketDetails[0]
  permissions?: UserWithPermissionsAndSubAccounts;
  contact?: Contact;
  plans?: {
    defaultPriceId: Plan
    plans: PricesList['data']
  }
}

type ModalContextType = {
  data: ModalData
  isOpen: boolean
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void
  setClose: () => void
}

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => { },
  setClose: () => { }
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [showingModal, setShowingModal] = useState<React.ReactNode | null>(null);
  const [isMounted, setisMounted] = useState(false);

  useEffect(() => {
    setisMounted(true);
  }, []);

  const setOpen = async (modal: React.ReactNode, fetchData?: () => Promise<any>) => {
    if (modal) {
      if (fetchData) {
        setData({ ...data, ...(await fetchData()) });
      }
      setShowingModal(modal);
      setIsOpen(true);
    } else {
      setData({});
    }
    setShowingModal(modal);
    setIsOpen(true);
  }

  const setClose = () => {
    setIsOpen(false);
    setData({});
  }

  if (!isMounted) {
    return null;
  }

  return <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }} >
    {children}
    {showingModal}
  </ModalContext.Provider>;
}


export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

export default ModalProvider