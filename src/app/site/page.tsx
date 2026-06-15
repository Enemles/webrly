import { InfiniteMovingCards } from "@/components/modules/landing/InfiniteMovingCard";
import { BentoMore } from "@/components/site/landing/BentoMore";
import { CtaSection } from "@/components/site/landing/CtaSection";
import { FaqSection } from "@/components/site/landing/FaqSection";
import { FeaturesSection } from "@/components/site/landing/FeaturesSection";
import GradualBlur from "@/components/site/landing/GradualBlur";
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

      {/* Flou progressif (React Bits) en bas du viewport, façon screen.studio.
          target="page" => overlay fixe, rendu uniquement sur la landing. */}
      <GradualBlur
        target="page"
        position="bottom"
        height="7rem"
        strength={2}
        divCount={6}
        curve="bezier"
        exponential
        opacity={1}
      />
    </div>
  );
}
