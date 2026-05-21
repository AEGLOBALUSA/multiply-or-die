import { Hero } from "@/components/hero/Hero";
import { VSLEmbed } from "@/components/vsl/VSLEmbed";
import { SponsorshipCounter } from "@/components/counter/SponsorshipCounter";
import { MultiplyForward } from "@/components/multiply-forward/MultiplyForward";
import { OrderForm } from "@/components/order/OrderForm";
import { EndorserCards } from "@/components/endorsements/EndorserCards";
import { FAQ } from "@/components/faq/FAQ";
import { getSponsorshipCounter } from "@/lib/counter";

export const revalidate = 60;

export default async function Home() {
  let counterData = { total_pastors_sponsored: 0, total_donated_cents: 0 };
  try {
    counterData = await getSponsorshipCounter();
  } catch {
    // Fail gracefully — show zeros
  }

  return (
    <main>
      <Hero />

      <VSLEmbed
        // Replace with your Vimeo or Wistia ID before launch
        vimeoId={process.env.NEXT_PUBLIC_VSL_VIMEO_ID}
        wistiaId={process.env.NEXT_PUBLIC_VSL_WISTIA_ID}
      />

      <SponsorshipCounter
        initialCount={counterData.total_pastors_sponsored}
        initialDonated={counterData.total_donated_cents}
      />

      <MultiplyForward />

      {/* Order form */}
      <section id="order-form" className="py-24 bg-obsidian-900">
        <div className="mx-auto max-w-[640px] px-6 sm:px-8">
          <OrderForm />
        </div>
      </section>

      <EndorserCards />

      <FAQ />

      {/* Footer */}
      <footer className="py-16 bg-obsidian-900 border-t border-obsidian-700">
        <div className="mx-auto max-w-display px-6 sm:px-12 lg:px-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="font-sans text-xs text-bone/30 text-center sm:text-left max-w-prose">
              Multiply or Die is published by Futures Church Global, a 501(c)(3) public charity.
              Donations are tax-deductible to the extent permitted by law. Book FMV: $24.99.
              {process.env.FCG_EIN ? ` EIN: ${process.env.FCG_EIN}.` : ""}
            </p>
            <nav className="flex gap-6" aria-label="Footer navigation">
              <a href="/privacy" className="font-sans text-xs text-bone/30 hover:text-bone/60 transition-colors">Privacy</a>
              <a href="/terms" className="font-sans text-xs text-bone/30 hover:text-bone/60 transition-colors">Terms</a>
              <a href="mailto:orders@multiplyordie.com" className="font-sans text-xs text-bone/30 hover:text-bone/60 transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}
