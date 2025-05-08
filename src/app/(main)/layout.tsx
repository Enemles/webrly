import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'
import { Analytics } from '@vercel/analytics/next';
import { dark } from '@clerk/themes'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>{children}
    <Analytics />
    </ClerkProvider>
  )
}

export default Layout