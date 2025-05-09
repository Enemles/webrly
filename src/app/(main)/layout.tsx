import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'
import { Analytics } from '@vercel/analytics/next';
import { dark } from '@clerk/themes'
import { SpeedInsights } from "@vercel/speed-insights/next"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      {children}
      <SpeedInsights />
      <Analytics />
    </ClerkProvider>
  )
}

export default Layout