import MaxWidthWrapper from '@/components/ui/max-width-wrapper'

import MagicBento from './MagicBento'
import { ScrollReveal } from './ScrollReveal'

export function BentoMore() {
  return (
    <section className="py-24 md:py-32">
      <MaxWidthWrapper>
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            And so much more
          </h2>
          <p className="mt-4 text-muted-foreground">
            Webrly is packed with tools to run every corner of your agency.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-12 flex justify-center">
          <MagicBento
            textAutoHide
            enableStars
            enableSpotlight
            enableBorderGlow
            enableTilt
            enableMagnetism
            clickEffect
            spotlightRadius={300}
            particleCount={12}
          />
        </ScrollReveal>
      </MaxWidthWrapper>
    </section>
  )
}
