import type { Metadata } from 'next'
import * as Sentry from '@sentry/nextjs';
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnarToaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import ModalProvider from '@/providers/modal-provider'

const font = DM_Sans({ subsets: ['latin'] })

export function generateMetadata(): Metadata {
  return {
    title: 'Weberly',
    description: 'All in one Agency Solution',
    other: {
      ...Sentry.getTraceData()
    }
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      className=''
      lang="en"
      suppressHydrationWarning
    >
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>
            {children}
            <Toaster />
            <SonnarToaster position="bottom-left" />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}