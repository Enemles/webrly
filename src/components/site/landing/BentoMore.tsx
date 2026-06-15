import MaxWidthWrapper from '@/components/ui/max-width-wrapper'
import { BENTO } from '@/config/bento'

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

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENTO.map((item) => {
            const Icon = item.icon
            return (
              <ScrollReveal key={item.title} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:border-[#00df7a]/50">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#00df7a]/10 text-[#00df7a]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
