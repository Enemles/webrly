'use client'

import { cn } from '@/lib/utils'
import type { LandingFeature } from '@/config/features'

import { ScrollReveal } from './ScrollReveal'
import { VideoFeature } from './VideoFeature'

/**
 * Un "acte" feature : énoncé bold + média démo, en colonnes alternées (reverse).
 */
export function FeatureAct({ feature }: { feature: LandingFeature }) {
  const { eyebrow, title, body, media, reverse } = feature

  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <ScrollReveal className={cn(reverse && 'md:order-2')}>
        <span className="text-sm font-semibold uppercase tracking-wider text-[#00df7a]">
          {eyebrow}
        </span>
        <h3 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-pretty text-muted-foreground">{body}</p>
      </ScrollReveal>

      <ScrollReveal delay={0.1} className={cn(reverse && 'md:order-1')}>
        <div className="bg-glow-green overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl ring-1 ring-white/10">
          <VideoFeature
            {...media}
            alt={title}
            className="h-auto w-full"
          />
        </div>
      </ScrollReveal>
    </div>
  )
}
