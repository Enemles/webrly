import MaxWidthWrapper from '@/components/ui/max-width-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { LANDING_FEATURES } from '@/config/features'

import { ScrollReveal } from './ScrollReveal'
import { VideoFeature } from './VideoFeature'

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

        <Tabs
          defaultValue={LANDING_FEATURES[0].id}
          orientation="vertical"
          className="mt-14 grid items-start gap-8 md:mt-20 md:grid-cols-2 md:gap-14"
        >
          {/* Liste cliquable (onglets) */}
          <TabsList className="flex h-auto flex-col gap-3 bg-transparent p-0">
            {LANDING_FEATURES.map((feature) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                className={cn(
                  'flex w-full flex-col items-start gap-1.5 whitespace-normal rounded-xl border border-transparent p-5 text-left transition-all',
                  'data-[state=active]:border-[#00df7a]/40 data-[state=active]:bg-card data-[state=active]:shadow-lg',
                  'data-[state=inactive]:opacity-60 data-[state=inactive]:hover:opacity-100',
                )}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[#00df7a]">
                  {feature.eyebrow}
                </span>
                <span className="text-lg font-bold text-foreground md:text-xl">
                  {feature.title}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {feature.body}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Média de l'onglet actif (sticky sur desktop) */}
          <div className="md:sticky md:top-28 md:self-start">
            {LANDING_FEATURES.map((feature) => (
              <TabsContent
                key={feature.id}
                value={feature.id}
                className="mt-0 duration-300 data-[state=active]:animate-in data-[state=active]:fade-in-50"
              >
                <div className="bg-glow-green overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl ring-1 ring-white/10">
                  <VideoFeature {...feature.media} alt={feature.title} className="h-auto w-full" />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </MaxWidthWrapper>
    </section>
  )
}
