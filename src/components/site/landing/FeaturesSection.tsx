import MaxWidthWrapper from '@/components/ui/max-width-wrapper'
import { LANDING_FEATURES } from '@/config/features'

import { FeatureAct } from './FeatureAct'
import { ScrollReveal } from './ScrollReveal'

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32">
      <MaxWidthWrapper>
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Everything your agency needs, in one place
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            From the first client site to the last closed deal — Webrly covers
            the whole journey, for your agency and every sub-account.
          </p>
        </ScrollReveal>

        <div className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-36">
          {LANDING_FEATURES.map((feature) => (
            <FeatureAct key={feature.id} feature={feature} />
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
