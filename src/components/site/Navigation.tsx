import React from "react";
import Image from "next/image";
import Link from "next/link";

import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { FloatingNav } from "@/components/ui/floating-navbar";

interface NavigationProps {}

const Navigation: React.FC<NavigationProps> = async ({}) => {
  const user = await currentUser();
  
  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "FAQ",
      link: "#faq",
    },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-4">
      <FloatingNav 
        className="px-4 w-[95%] max-w-7xl justify-between"
        navItems={navItems}
        logo={
          <div className="flex items-center gap-2">
            {/* <Image src={logoImage} width={40} height={40} alt="Webrly Logo" /> */}
            <span className="text-xl font-bold">Webrly.</span>
          </div>
        }
        buttons={
          <div className="flex items-center gap-2">
            <Link href="/agency" className={cn(buttonVariants({ size: "sm" }))}>
              {user ? "Dashboard" : "Get Started"}
            </Link>
            {user && <UserButton afterSignOutUrl="/" />}
          </div>
        }
      />
    </header>
  );
};

export default Navigation;
