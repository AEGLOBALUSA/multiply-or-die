"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { PWYCSlider } from "@/components/pwyc/PWYCSlider";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

const SHIPPING_OPTIONS = [
  { id: "standard" as const, label: "Standard Shipping",  price: 995,  days: "5–7 business days" },
  { id: "priority" as const, label: "Priority Shipping",  price: 1295, days: "2–3 business days" },
];

type UTM = { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string };

function readUTM(): UTM {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem("utm");
    return stored ? (JSON.parse(stored) as UTM) : {};
  } catch {
    return {};
  }
}

export function OrderForm() {
  const [shippingOption, setShippingOption] = useState<"standard" | "priority">("standard");
  const [donationCents, setDonationCents] = useState(2500);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingPrice = SHIPPING_OPTIONS.find((o) => o.id === shippingOption)!.price;
  const total = shippingPrice + donationCents;

  useEffect(() => {
    // Capture and persist UTM params from URL on first mount
    const params = new URLSearchParams(window.location.search);
    const utm: UTM = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) => {
      const val = params.get(key);
      if (val) utm[key as keyof UTM] = val;
    });
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem("utm", JSON.stringify(utm));
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic email validation before hitting the server
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_option: shippingOption,
          donation_cents: donationCents,
          customer_email: email,
          customer_name: firstName || undefined,
          utm: readUTM(),
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      id="order-form"
      onSubmit={handleSubmit}
      className="bg-obsidian-800 rounded-3xl border border-obsidian-600 p-8 md:p-12 space-y-8"
      noValidate
    >
      <div>
        <h2 className="font-display text-display-md text-bone mb-2">Get your free copy</h2>
        <p className="font-sans text-bone/60 text-sm">The book is free. You pay shipping.</p>
      </div>

      {/* Shipping toggle */}
      <fieldset>
        <legend className="font-sans font-semibold text-bone text-sm uppercase tracking-widest mb-3">
          Shipping option
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SHIPPING_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={cn(
                "relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-150",
                shippingOption === opt.id
                  ? "bg-violet/10 border-violet"
                  : "bg-obsidian-700 border-obsidian-500 hover:border-obsidian-400"
              )}
            >
              <input
                type="radio"
                name="shipping"
                value={opt.id}
                checked={shippingOption === opt.id}
                onChange={() => setShippingOption(opt.id)}
                className="sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  shippingOption === opt.id ? "border-violet bg-violet" : "border-bone/30"
                )}
                aria-hidden="true"
              >
                {shippingOption === opt.id && (
                  <span className="h-2 w-2 rounded-full bg-bone" />
                )}
              </span>
              <div>
                <p className="font-sans font-semibold text-bone text-sm">{opt.label}</p>
                <p className="font-sans text-bone/50 text-xs mt-0.5">{opt.days}</p>
              </div>
              <span className="ml-auto font-sans font-bold text-bone text-sm self-center">
                {formatCurrency(opt.price)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Contact fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block font-sans text-sm font-medium text-bone/70 mb-1.5">
            First name <span className="text-bone/30 font-normal">(optional)</span>
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            className={cn(
              "w-full px-4 py-3 rounded-xl font-sans",
              "bg-obsidian-700 border border-obsidian-500 text-bone",
              "focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent",
              "placeholder:text-bone/30"
            )}
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-sans text-sm font-medium text-bone/70 mb-1.5">
            Email <span className="text-red-400 font-normal" aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pastor@yourchurch.com"
            className={cn(
              "w-full px-4 py-3 rounded-xl font-sans",
              "bg-obsidian-700 border border-obsidian-500 text-bone",
              "focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent",
              "placeholder:text-bone/30"
            )}
            aria-required="true"
            aria-describedby="email-desc"
          />
          <p id="email-desc" className="text-xs text-bone/40 mt-1 font-sans">
            Your receipt, book tracking, and masterclass arrive here.
          </p>
        </div>
      </div>

      {/* Honeypot — hidden from real users, caught by server */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
        autoComplete="off"
      />

      {/* PWYC donation slider */}
      <PWYCSlider onDonationChange={setDonationCents} initialCents={2500} />

      {/* Order summary */}
      <div className="bg-obsidian-700 rounded-2xl p-5 space-y-2 font-sans text-sm">
        <div className="flex justify-between text-bone/60">
          <span>Multiply or Die (hardback)</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between text-bone/60">
          <span>Shipping</span>
          <span>{formatCurrency(shippingPrice)}</span>
        </div>
        {donationCents > 0 && (
          <div className="flex justify-between text-violet">
            <span>Multiply It Forward donation</span>
            <span>{formatCurrency(donationCents)}</span>
          </div>
        )}
        <div className="border-t border-obsidian-500 pt-2 mt-2 flex justify-between font-semibold text-bone text-base">
          <span>Total today</span>
          <span>{formatCurrency(total)}</span>
        </div>
        {donationCents > 0 && (
          <p className="text-xs text-bone/40 pt-1">
            Donation is tax-deductible. Shipping and book are not.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-red-400 font-sans">
          {error}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="gold"
        size="lg"
        loading={loading}
        className="w-full text-base font-bold"
        aria-label={`Order book and ${donationCents > 0 ? "give forward" : "pay shipping"} — total ${formatCurrency(total)}`}
      >
        {donationCents > 0 ? "Order Book + Give Forward →" : "Order My Free Copy →"}
      </Button>

      <p className="text-center text-xs text-bone/30 font-sans">
        Secured by Stripe. You will be redirected to complete payment.
      </p>
    </form>
  );
}
