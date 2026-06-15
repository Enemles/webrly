'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

import { HeroSilkBackground } from './HeroSilkBackground'
import { ScrollReveal } from './ScrollReveal'

export function LandingHero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  // Le preview produit se "redresse" au scroll (perspective -> à plat).
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const rotateX = useTransform(scrollYProgress, [0, 0.6], [22, 0])
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.94, 1])

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pt-32 md:pt-40"
    >
      <HeroSilkBackground />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <ScrollReveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <span className="size-1.5 rounded-full bg-[#00df7a]" />
            Webrly Connect 2025
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
            Run your agency in{' '}
            <span className="text-gradient-green">just one place.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            Build client sites, manage pipelines, give your team access, and
            track every lead — for your agency and all its sub-accounts.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/agency"
              className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-8')}
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'rounded-full border-border bg-background/40 px-8 backdrop-blur',
              )}
            >
              See features
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Preview produit, légèrement incliné puis redressé au scroll */}
      <motion.div
        style={
          reduce
            ? undefined
            : { rotateX, scale, transformPerspective: 1200, transformOrigin: 'top center' }
        }
        className="relative z-10 mt-14 w-full max-w-5xl md:mt-20"
      >
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl ring-1 ring-white/10">
          <Image
            src="/assets/preview.png"
            alt="Aperçu du tableau de bord Webrly"
            width={1280}
            height={800}
            priority
            className="h-auto w-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
