import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import MaxWidthWrapper from '@/components/ui/max-width-wrapper'
import { FAQ } from '@/config/faq'

import { ScrollReveal } from './ScrollReveal'

export function FaqSection() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <MaxWidthWrapper>
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Questions & answers
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about Webrly.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, index) => (
              <AccordionItem key={item.q} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </MaxWidthWrapper>
    </section>
  )
}
