import Navigation from '@/components/site/Navigation'
import { SiteFooter } from '@/components/site/landing/SiteFooter'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import React from 'react'

// La landing marketing est toujours en dark (identité verte de Webrly),
// indépendamment du thème du dashboard. On force la palette sombre via la
// classe `.dark` (stratégie darkMode: 'class' de Tailwind) plutôt qu'un
// ThemeProvider imbriqué, pour éviter tout conflit avec next-themes global.
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <div className="dark">
        <main className="min-h-screen bg-background text-foreground">
          <Navigation />
          {children}
          <SiteFooter />
        </main>
      </div>
    </ClerkProvider>
  )
}

export default layout