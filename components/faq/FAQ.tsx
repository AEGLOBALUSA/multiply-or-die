"use client";

import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/Section";

const FAQ_ITEMS = [
  {
    q: "When does the book ship?",
    a: "Orders are processed within 2–3 business days. Standard shipping takes 5–7 business days after that. Priority shipping takes 2–3 business days.",
  },
  {
    q: "What is Multiply It Forward?",
    a: "When you donate above the shipping cost, 100% of that donation goes to Futures Church Global's mission to sponsor pastors in under-resourced communities. Every $20 sponsors one pastor to access the same leadership resources you're receiving.",
  },
  {
    q: "Is my donation tax-deductible?",
    a: "Yes. Futures Church Global is a registered 501(c)(3) public charity (EIN on file). The donation portion of your payment — everything above shipping — is tax-deductible. You will receive an IRS-compliant receipt by email. The book and shipping are not tax-deductible.",
  },
  {
    q: "What does FCG do with the donation?",
    a: "Futures Church Global uses donations to create and distribute leadership and multiplication resources to pastors worldwide — particularly in regions where cost is a barrier. Your sponsored pastors receive training, teaching materials, and community access.",
  },
  {
    q: "Can I donate without ordering the book?",
    a: "You can donate directly to Futures Church Global at futurescollege.com. This page is specifically for the book + masterclass funnel. A separate giving page for FCG is available for those who want to give without the book offer.",
  },
  {
    q: "What is the Multiplication Masterclass?",
    a: "After you order, you will receive a 10-part email series with exclusive video teaching from Ashley Evans, exercises, and community access — all designed to take the principles in the book from concept to action in your church.",
  },
  {
    q: "What is the refund policy?",
    a: "We want you to be fully satisfied. If your book arrives damaged, email us at orders@multiplyordie.com and we will make it right. Donations to FCG are non-refundable once processed.",
  },
];

export function FAQ() {
  return (
    <Section eyebrow="Common questions" tone="darker">
      <div className="max-w-prose mx-auto space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={i}
            className={cn(
              "group rounded-2xl border border-obsidian-500 overflow-hidden",
              "open:bg-obsidian-700"
            )}
          >
            <summary className={cn(
              "flex items-center justify-between gap-4 px-6 py-5 cursor-pointer",
              "font-sans font-semibold text-bone text-sm select-none",
              "list-none [&::-webkit-details-marker]:hidden",
              "hover:bg-obsidian-700 transition-colors"
            )}>
              {item.q}
              <span
                className="flex-shrink-0 text-bone/40 transition-transform duration-200 group-open:rotate-45"
                aria-hidden="true"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
              </span>
            </summary>
            <p className="px-6 pb-5 font-body text-bone/70 text-sm leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      {/* FAQPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </Section>
  );
}
