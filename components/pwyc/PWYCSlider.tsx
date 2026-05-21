"use client";

import { useState, useId } from "react";
import { cn } from "@/lib/utils";
import { buildSliderMicrocopy, computeSponsoredPastors } from "@/lib/pwyc";

interface PWYCSliderProps {
  onDonationChange: (cents: number) => void;
  initialCents?: number;
}

const ANCHORS = [
  { label: "$0",    cents: 0    },
  { label: "$20",   cents: 2000 },
  { label: "$100",  cents: 10000 },
  { label: "$400",  cents: 40000 },
];

const MAX_CENTS = 50000;

export function PWYCSlider({ onDonationChange, initialCents = 2500 }: PWYCSliderProps) {
  const sliderId = useId();
  const [donationCents, setDonationCents] = useState(initialCents);
  const [useCustom, setUseCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  function update(cents: number) {
    const clamped = Math.max(0, Math.min(MAX_CENTS, cents));
    setDonationCents(clamped);
    onDonationChange(clamped);
  }

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    update(parseInt(e.target.value));
  }

  function handleAnchorClick(cents: number) {
    update(cents);
    setUseCustom(false);
  }

  function handleCustomBlur() {
    const raw = customInput.replace(/[$,]/g, "");
    const dollars = parseFloat(raw);
    if (!isNaN(dollars) && dollars >= 0) {
      update(Math.round(dollars * 100));
    }
  }

  function handleCustomKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleCustomBlur();
  }

  const microcopy = buildSliderMicrocopy(donationCents);
  const pastors = computeSponsoredPastors(donationCents);
  const displayDollars = (donationCents / 100).toFixed(2);
  // Progress fill width for visual track
  const fillPct = Math.min(100, (donationCents / MAX_CENTS) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <label htmlFor={sliderId} className="font-sans font-semibold text-bone text-sm uppercase tracking-widest">
          Add a donation
        </label>
        <button
          type="button"
          onClick={() => {
            setUseCustom(!useCustom);
            if (!useCustom) setCustomInput(`$${(donationCents / 100).toFixed(2)}`);
          }}
          className="text-sm text-violet hover:text-violet-600 transition-colors font-sans"
          aria-label={useCustom ? "Use slider" : "Enter custom amount"}
        >
          {useCustom ? "← Use slider" : "Custom amount"}
        </button>
      </div>

      {useCustom ? (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bone/60 font-sans" aria-hidden="true">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onBlur={handleCustomBlur}
            onKeyDown={handleCustomKeyDown}
            placeholder="0.00"
            className={cn(
              "w-full pl-8 pr-4 py-3 rounded-xl font-sans text-lg",
              "bg-obsidian-700 border border-obsidian-500 text-bone",
              "focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent",
              "placeholder:text-bone/30"
            )}
            aria-label="Custom donation amount in dollars"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Slider */}
          <div className="relative">
            <input
              id={sliderId}
              type="range"
              min={0}
              max={MAX_CENTS}
              step={100}
              value={donationCents}
              onChange={handleSliderChange}
              className="w-full h-1.5"
              aria-label="Donation amount"
              aria-valuemin={0}
              aria-valuemax={MAX_CENTS}
              aria-valuenow={donationCents}
              aria-valuetext={`$${displayDollars}`}
            />
            {/* Visual fill bar */}
            <div
              className="absolute top-0 left-0 h-1.5 rounded-full bg-violet pointer-events-none"
              style={{ width: `${fillPct}%` }}
              aria-hidden="true"
            />
          </div>

          {/* Anchor quick-select */}
          <div className="flex justify-between" role="group" aria-label="Preset donation amounts">
            {ANCHORS.map(({ label, cents }) => (
              <button
                key={cents}
                type="button"
                onClick={() => handleAnchorClick(cents)}
                className={cn(
                  "text-sm font-sans px-3 py-1.5 rounded-full transition-all duration-150 min-h-[36px]",
                  donationCents === cents
                    ? "bg-violet text-bone"
                    : "bg-obsidian-600 text-bone/60 hover:bg-obsidian-500 hover:text-bone"
                )}
                aria-pressed={donationCents === cents}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live microcopy */}
      <p
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "text-sm font-sans transition-opacity duration-200",
          donationCents === 0 ? "text-bone/40" : "text-bone/80"
        )}
      >
        {microcopy}
        {pastors > 0 && (
          <span className="ml-1 text-violet font-medium" aria-hidden="true">✦</span>
        )}
      </p>
    </div>
  );
}
