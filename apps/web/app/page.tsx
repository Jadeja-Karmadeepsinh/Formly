import type { Metadata } from "next";

import { LandingNavbar } from "~/components/landing/navbar";
import { LandingHero } from "~/components/landing/hero";
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
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-foreground selection:text-background font-sans antialiased">
      {/* 1. Navigation Bar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section with Interactive Live Form Builder & Runner Demo */}
        <LandingHero />

        {/* 3. Product Philosophy & Architectural Principles */}
        <LandingPhilosophy />

        {/* 4. Core Features with Distinct Visual Treatments */}
        <LandingFeatures />

        {/* 5. Complete Product Showcase (Editor, History, Submissions, Preview) */}
        <LandingProductShowcase />

        {/* 6. How It Works (01 Create, 02 Share, 03 Collect) */}
        <LandingHowItWorks />

        {/* 7. Practical Use Cases */}
        <LandingUseCases />

        {/* 8. Product Differentiation (Traditional vs The Formly Way) */}
        <LandingDifferentiation />

        {/* 9. Accessible Frequently Asked Questions */}
        <LandingFAQ />

        {/* 10. Final Conversion Call-to-Action */}
        <LandingCTASection />
      </main>

      {/* 11. Refined Footer */}
      <LandingFooter />
    </div>
  );
}
