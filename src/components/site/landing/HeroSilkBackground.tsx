'use client'

import dynamic from 'next/dynamic'

import { useReducedMotion } from '@/hooks/use-reduced-motion'

// Silk = WebGL (three + r3f). On le charge en lazy, côté client uniquement
// (Canvas non SSR-able), pour le garder hors du bundle initial du hero.
const Silk = dynamic(() => import('./Silk'), { ssr: false })

/**
 * Fond animé "Silk" du hero, recoloré aux verts Webrly.
 * - prefers-reduced-motion : pas de canvas WebGL, simple dégradé vert statique.
 * - Voile dégradé par-dessus pour la lisibilité du texte et le fondu vers la page.
 */
export function HeroSilkBackground() {
  const reduce = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {reduce ? (
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#0a3f2c_0%,#02160f_65%)]" />
      ) : (
        <div className="absolute inset-0 opacity-[0.65]">
          <Silk
            speed={5}
            scale={1}
            noiseIntensity={1.3}
            rotation={0}
            colorLight="#00df7a"
            colorDark="#02160f"
          />
        </div>
      )}

      {/* Voile : assombrit légèrement + fond la soie dans le background en bas */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_38%,transparent_0%,hsl(var(--background)/0.55)_100%)]" />
    </div>
  )
}
