"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { CounterRow } from "@/lib/counter";

interface SponsorshipCounterProps {
  initialCount: number;
  initialDonated: number;
}

function formatCounterNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`;
  }
  return `$${dollars.toLocaleString("en-US")}`;
}

export function SponsorshipCounter({ initialCount, initialDonated }: SponsorshipCounterProps) {
  const [pastors, setPastors] = useState(initialCount);
  const [donated, setDonated] = useState(initialDonated);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/counter");
      if (!res.ok) return;
      const data = (await res.json()) as CounterRow;
      setPastors(data.total_pastors_sponsored);
      setDonated(data.total_donated_cents);
    } catch {
      // Fail silently — stale data is fine
    }
  }, []);

  useEffect(() => {
    // Poll every 30s for live updates
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <section
      className="py-16 bg-obsidian-900 border-y border-obsidian-700"
      aria-label="Multiply It Forward sponsorship counter"
    >
      <div className="mx-auto max-w-display px-6 sm:px-12 lg:px-20">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-20">
          <div className="text-center">
            <p
              className={cn("font-display text-display-xl text-gold tabular-nums")}
              aria-live="polite"
              aria-atomic="true"
              aria-label={`${formatCounterNumber(pastors)} pastors sponsored`}
            >
              {formatCounterNumber(pastors)}
            </p>
            <p className="font-sans text-sm text-bone/50 mt-2 uppercase tracking-widest">
              Pastors sponsored
            </p>
          </div>

          <div className="hidden sm:block w-px h-16 bg-obsidian-600" aria-hidden="true" />

          <div className="text-center">
            <p
              className="font-display text-display-xl text-violet tabular-nums"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`${formatCurrency(donated)} given to FCG mission`}
            >
              {formatCurrency(donated)}
            </p>
            <p className="font-sans text-sm text-bone/50 mt-2 uppercase tracking-widest">
              Given to FCG mission
            </p>
          </div>
        </div>

        <p className="text-center font-sans text-sm text-bone/30 mt-8">
          Every $20 sponsors one pastor to receive free resources and teaching.
        </p>
      </div>
    </section>
  );
}
