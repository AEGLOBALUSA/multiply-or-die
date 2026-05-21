import { describe, it, expect } from "vitest";
import {
  computeSponsoredPastors,
  computeDeductibleAmount,
  validateDonationAmount,
  buildSliderMicrocopy,
} from "@/lib/pwyc";

describe("computeSponsoredPastors", () => {
  it("returns 0 for $0", () => expect(computeSponsoredPastors(0)).toBe(0));
  it("returns 0 for $19.99", () => expect(computeSponsoredPastors(1999)).toBe(0));
  it("returns 1 for exactly $20", () => expect(computeSponsoredPastors(2000)).toBe(1));
  it("returns 1 for $24.99", () => expect(computeSponsoredPastors(2499)).toBe(1));
  it("returns 2 for $40", () => expect(computeSponsoredPastors(4000)).toBe(2));
  it("returns 5 for $100", () => expect(computeSponsoredPastors(10000)).toBe(5));
  it("returns 20 for $400", () => expect(computeSponsoredPastors(40000)).toBe(20));
});

describe("computeDeductibleAmount", () => {
  const BOOK_FMV = 2499;
  const SHIPPING = 995;

  it("returns 0 when donation covers only goods (no donation line item)", () => {
    expect(computeDeductibleAmount(0, BOOK_FMV, SHIPPING)).toBe(0);
  });

  it("returns donation amount when donation is its own line item (3-product model)", () => {
    expect(computeDeductibleAmount(2000, 0, 0)).toBe(2000);
  });

  it("clamps negative values to 0", () => {
    expect(computeDeductibleAmount(100, 2499, 995)).toBe(0);
  });

  it("calculates correctly for $20 donation above shipping", () => {
    // In 2-product model: paid = 9.95 + 20 = 29.95; deductible = 20 - 24.99 - 9.95 = 0 (clamped)
    // In 3-product model: donation line = 20.00; deductible = 20.00
    expect(computeDeductibleAmount(2000, 0, 0)).toBe(2000); // 3-product
  });

  it("handles large donations", () => {
    expect(computeDeductibleAmount(40000, 0, 0)).toBe(40000);
  });
});

describe("validateDonationAmount", () => {
  it("allows 0", () => expect(validateDonationAmount(0)).toBe(true));
  it("allows typical amounts", () => expect(validateDonationAmount(2500)).toBe(true));
  it("allows max", () => expect(validateDonationAmount(5_000_000)).toBe(true));
  it("rejects negative", () => expect(validateDonationAmount(-1)).toBe(false));
  it("rejects above max", () => expect(validateDonationAmount(5_000_001)).toBe(false));
  it("rejects non-integer", () => expect(validateDonationAmount(9.99)).toBe(false));
});

describe("buildSliderMicrocopy", () => {
  it("shows 'no donation' for $0", () => {
    expect(buildSliderMicrocopy(0)).toBe("No donation — just the book");
  });

  it("shows amount without pastors for < $20", () => {
    const text = buildSliderMicrocopy(1000);
    expect(text).toContain("$10");
    expect(text).not.toContain("pastor");
  });

  it("shows singular pastor for exactly $20", () => {
    expect(buildSliderMicrocopy(2000)).toContain("1 pastor");
  });

  it("shows plural pastors for $40", () => {
    expect(buildSliderMicrocopy(4000)).toContain("2 pastors");
  });
});
