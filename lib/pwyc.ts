/** Number of pastors sponsored at the given donation level ($20 = 1 pastor). */
export function computeSponsoredPastors(donationCents: number): number {
  return Math.floor(donationCents / 2000);
}

/**
 * Tax-deductible amount after subtracting FMV of goods received.
 * Only relevant for the 2-line-item Stripe model.
 * For 3-line-item model the donation line IS the deductible amount.
 */
export function computeDeductibleAmount(
  donationCents: number,
  bookFmvCents: number,
  shippingCents: number
): number {
  return Math.max(0, donationCents - bookFmvCents - shippingCents);
}

/** Validates a donation amount is a non-negative integer in cents, max $50,000. */
export function validateDonationAmount(cents: number): boolean {
  return Number.isInteger(cents) && cents >= 0 && cents <= 5_000_000;
}

/** Live slider microcopy shown under the PWYC slider. */
export function buildSliderMicrocopy(donationCents: number): string {
  if (donationCents === 0) return "No donation — just the book";
  const pastors = computeSponsoredPastors(donationCents);
  const amount = formatCentsConcise(donationCents);
  if (pastors === 0) return `${amount} to FCG mission`;
  const label = pastors === 1 ? "pastor" : "pastors";
  return `${amount} to FCG mission • Sponsors ${pastors} ${label}`;
}

function formatCentsConcise(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
