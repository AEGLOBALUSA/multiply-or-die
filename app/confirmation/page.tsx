import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { getDonationByPaymentIntent } from "@/lib/ledger";
import { formatCurrency } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  let paymentIntentId: string | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      redirect("/");
    }

    paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
  } catch {
    redirect("/");
  }

  const donation = paymentIntentId
    ? await getDonationByPaymentIntent(paymentIntentId).catch(() => null)
    : null;

  const orderRef = paymentIntentId?.slice(-8).toUpperCase() ?? "—";

  return (
    <main className="min-h-screen bg-obsidian-900 flex items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Checkmark */}
        <div className="mx-auto w-20 h-20 rounded-full bg-violet/10 border border-violet/30 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-9 h-9 text-violet" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-display-lg text-bone">You&rsquo;re in.</h1>
          <p className="font-body text-bone/60 text-body">
            Your book is confirmed. Order <span className="font-mono text-bone/80 text-sm">#{orderRef}</span>
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-obsidian-800 rounded-2xl border border-obsidian-600 p-6 text-left space-y-4">
          <h2 className="font-sans font-semibold text-bone text-sm uppercase tracking-widest">What happens next</h2>
          <ol className="space-y-3 font-body text-bone/70 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet/20 text-violet font-sans font-bold text-xs flex items-center justify-center">1</span>
              Check your inbox — your order confirmation and masterclass access are on the way.
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet/20 text-violet font-sans font-bold text-xs flex items-center justify-center">2</span>
              Your book will ship within 2–3 business days. You will receive a tracking notification.
            </li>
            {donation && donation.donation_amount_cents > 0 && (
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold font-sans font-bold text-xs flex items-center justify-center">3</span>
                Your tax receipt for your {formatCurrency(donation.donation_amount_cents)} donation to Futures Church Global is on its way.
              </li>
            )}
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet/20 text-violet font-sans font-bold text-xs flex items-center justify-center">
                {donation && donation.donation_amount_cents > 0 ? "4" : "3"}
              </span>
              Over the next 14 days you will receive your Multiplication Masterclass — 10 sessions from Ashley Evans.
            </li>
          </ol>
        </div>

        {/* Sponsorship callout */}
        {donation && donation.sponsored_pastors > 0 && (
          <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5 text-center">
            <p className="font-display text-display-md text-gold">
              {donation.sponsored_pastors} {donation.sponsored_pastors === 1 ? "pastor" : "pastors"} sponsored
            </p>
            <p className="font-sans text-bone/60 text-sm mt-1">
              Because of your {formatCurrency(donation.donation_amount_cents)} donation
            </p>
          </div>
        )}

        <a
          href="/"
          className="inline-flex items-center font-sans text-sm text-bone/40 hover:text-bone/70 transition-colors"
        >
          ← Back to home
        </a>
      </div>
    </main>
  );
}
