'use client';

import { Agency, User } from "@prisma/client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}

export type ModalData = {
  user?: User;
  agencyId?: Agency;
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
    }
    setData({});
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
}

export default ModalProvider