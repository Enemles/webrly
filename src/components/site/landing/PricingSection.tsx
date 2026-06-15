'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import MaxWidthWrapper from '@/components/ui/max-width-wrapper'
import { PRICING } from '@/config/pricing'

import { ChromaCard, ChromaGrid } from './ChromaGrid'
import { ScrollReveal } from './ScrollReveal'

// La data est dans l'ordre Starter / Unlimited / Basic -> on réordonne pour
// l'affichage (Starter, Basic mis en avant, Unlimited).
const DISPLAY_ORDER = ['price_1', 'price_3', 'price_2']
const POPULAR_ID = 'price_3'

// Accent « chroma » par offre (révélé au survol). Le plan populaire garde le
// vert Webrly ; les autres reçoivent une teinte distincte pour l'effet.
const ACCENTS: Record<string, string> = {
  price_1: '#38bdf8', // Starter — sky
  price_3: '#00df7a', // Basic (populaire) — vert Webrly
  price_2: '#8b5cf6', // Unlimited — violet
}

function parsePrice(price: string): number | null {
  const n = parseFloat(price.replace(/[^0-9.,]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function formatEur(n: number): string {
  return `${n.toFixed(2).replace('.', ',')}€`
}

export function PricingSection() {
  const [yearly, setYearly] = useState(false)
  const plans = DISPLAY_ORDER.map((id) => PRICING.find((p) => p.id === id)).filter(
    (p): p is (typeof PRICING)[number] => Boolean(p),
  )

  return (
    <section id="pricing" className="py-24 md:py-32">
      <MaxWidthWrapper>
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Simple pricing that scales with you
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, upgrade when you grow. Cancel anytime.
          </p>
        </ScrollReveal>

        {/* Toggle mensuel / annuel */}
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                'rounded-full px-4 py-1.5 transition-colors',
                !yearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                'rounded-full px-4 py-1.5 transition-colors',
                yearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              Yearly <span className="text-[#00df7a]">−20%</span>
            </button>
          </div>
        </div>

        <ChromaGrid className="mx-auto mt-12 max-w-5xl" radius={340}>
          <div className="grid items-stretch gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const popular = plan.id === POPULAR_ID
              const base = parsePrice(plan.price)
              const isFree = base === null
              // TODO(content): vrais prix annuels (ici -20% calculé sur le mensuel).
              const display = isFree ? plan.price : yearly ? formatEur(base * 0.8) : formatEur(base)

              return (
                <ScrollReveal key={plan.id} className="h-full">
                  <ChromaCard
                    accent={ACCENTS[plan.id] ?? '#00df7a'}
                    className={cn(
                      'flex h-full flex-col rounded-2xl border p-6',
                      popular
                        ? 'border-[#00df7a] bg-glow-green shadow-2xl'
                        : 'border-border bg-card',
                    )}
                  >
                    {popular && (
                      <span className="mb-3 inline-flex w-fit rounded-full bg-[#00df7a] px-3 py-1 text-xs font-semibold text-[#02160f]">
                        Most popular
                      </span>
                    )}
                    <h3 className="text-xl font-semibold">{plan.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-5 flex items-end gap-1">
                      <span className="text-4xl font-bold tracking-tight">{display}</span>
                      {!isFree && (
                        <span className="mb-1 text-sm text-muted-foreground">
                          /{yearly ? 'mo, billed yearly' : 'month'}
                        </span>
                      )}
                    </div>
                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-[#00df7a]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/agency?plan=${plan.priceId}`}
                      className={cn(
                        buttonVariants({ variant: popular ? 'default' : 'outline' }),
                        'mt-6 w-full rounded-full',
                      )}
                    >
                      Get Started
                    </Link>
                  </ChromaCard>
                </ScrollReveal>
              )
            })}
          </div>
        </ChromaGrid>
      </MaxWidthWrapper>
    </section>
  )
}
