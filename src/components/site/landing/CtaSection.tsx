import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import MaxWidthWrapper from '@/components/ui/max-width-wrapper'

import { ScrollReveal } from './ScrollReveal'

export function CtaSection() {
  return (
    <section className="py-24 md:py-32">
      <MaxWidthWrapper>
        <ScrollReveal className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center md:py-24">
          <div className="bg-glow-green pointer-events-none absolute inset-0" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Ready to run your agency in{' '}
              <span className="text-gradient-green">one place</span>?
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Bring your sites, pipelines, team and leads together. Get started
              for free — no card required.
            </p>
            <Link
              href="/agency"
              className={cn(buttonVariants({ size: 'lg' }), 'mt-8 rounded-full px-8')}
            >
              Get Started
            </Link>
          </div>
        </ScrollReveal>
      </MaxWidthWrapper>
    </section>
  )
}
