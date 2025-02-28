import { UserButton } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ModeToggle } from '../global/mode-toggle'

interface Props {
  user?: null | User
}

const Navigation = ({ user }: Props) => {
  return (
    <div className="p-4 flex items-center justify-between relative">
      <aside className='flex items-center gap-2'>
        <div className="w-[32px] h-[32px] text-black dark:text-white"> W. </div>
      </aside>
      <nav className='hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <ul className="flex items-center justify-center gap-8">
          <Link href={'#'}>Pricing</Link>
          <Link href={'#'}>Features</Link>
          <Link href={'#'}>Contact</Link>


        </ul>
      </nav>
      <aside className='flex items-center gap-2'>
        <Link href={'/agency'}>Agency</Link>
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  )
}

export default Navigation
