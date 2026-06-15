import { InfiniteMovingCards } from "@/components/modules/landing/InfiniteMovingCard";
import { BentoMore } from "@/components/site/landing/BentoMore";
import { CtaSection } from "@/components/site/landing/CtaSection";
import { FaqSection } from "@/components/site/landing/FaqSection";
import { FeaturesSection } from "@/components/site/landing/FeaturesSection";
import { LandingHero } from "@/components/site/landing/LandingHero";
import { PricingSection } from "@/components/site/landing/PricingSection";
import { StatsBand } from "@/components/site/landing/StatsBand";

export const dynamic = 'force-dynamic'

export default async function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      <LandingHero />
      <FeaturesSection />
      <BentoMore />
      <StatsBand />
      {/* TODO(content): remplacer par de vrais témoignages (contenu placeholder) */}
      <section className="w-full py-10">
        <InfiniteMovingCards pauseOnHover={false} speed="slow" />
      </section>
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
