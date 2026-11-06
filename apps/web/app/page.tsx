import type { Metadata } from "next";

import { PageFrame } from "~/components/landing/frame";
import { LandingNavbar } from "~/components/landing/navbar";
import { LandingHero } from "~/components/landing/hero";
import { LandingCredibilityStrip } from "~/components/landing/credibility-strip";
import { LandingPhilosophy } from "~/components/landing/philosophy";
import { LandingFeatures } from "~/components/landing/features";
import { LandingProductShowcase } from "~/components/landing/product-showcase";
import { LandingHowItWorks } from "~/components/landing/how-it-works";
import { LandingUseCases } from "~/components/landing/use-cases";
import { LandingDifferentiation } from "~/components/landing/differentiation";
import { LandingFAQ } from "~/components/landing/faq";
import { LandingCTASection } from "~/components/landing/cta-section";
import { LandingFooter } from "~/components/landing/footer";

export const metadata: Metadata = {
  title: "Formly — Document-First SaaS Form Builder",
  description:
    "Create thoughtful forms with a fluid document-first editor, publish in seconds with immutable version snapshots, and collect clean responses in one organized workspace.",
  openGraph: {
    title: "Formly — Document-First SaaS Form Builder",
    description:
      "Create thoughtful forms with a fluid document-first editor, publish in seconds with immutable version snapshots, and collect clean responses in one organized workspace.",
    type: "website",
    siteName: "Formly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formly — Document-First SaaS Form Builder",
    description:
      "Create thoughtful forms with a fluid document-first editor, publish in seconds with immutable version snapshots, and collect clean responses in one organized workspace.",
  },
};

export default function HomePage() {
  return (
    <PageFrame>
      {/* 1. Engineered Hairline Navigation */}
      <LandingNavbar />

      <main className="w-full">
        {/* 2. Hero with Document-First Promise & Interactive Window Preview */}
        <LandingHero />

        {/* 3. Technology & Architecture Credibility Strip */}
        <LandingCredibilityStrip />

        {/* 4. Architectural Principles */}
        <LandingPhilosophy />

        {/* 5. Core Feature Lined Bento Grid */}
        <LandingFeatures />

        {/* 6. Deep-Dive Alternating Workflow Demonstrations */}
        <LandingProductShowcase />

        {/* 7. 3-Step Process & Platform Performance Metrics */}
        <LandingHowItWorks />

        {/* 8. Practical Use Cases with Count Badge */}
        <LandingUseCases />

        {/* 9. Architectural Comparison Table */}
        <LandingDifferentiation />

        {/* 10. Frequently Asked Questions Hairline Accordion */}
        <LandingFAQ />

        {/* 11. Final Call-to-Action */}
        <LandingCTASection />
      </main>

      {/* 12. Multi-Column Engineered Lined Footer */}
      <LandingFooter />
    </PageFrame>
  );
}
