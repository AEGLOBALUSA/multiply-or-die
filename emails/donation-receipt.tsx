/**
 * IRS-COMPLIANT DONATION RECEIPT
 *
 * ⚠️  LEGAL REVIEW REQUIRED before first production send.
 *
 * This template satisfies IRS quid-pro-quo disclosure requirements
 * (IRS Publication 1771) for donations over $75 where goods are received.
 *
 * Key assumptions (confirm with CPA before launch):
 *   - Book FMV = $24.99 (the established retail price)
 *   - Shipping FMV = the actual shipping amount charged (taxable product line item)
 *   - Deductible amount = donation line item (3-line-item Stripe model)
 *   - Org name, EIN, and address are correct on file with the IRS
 *
 * If using the 2-line-item model instead, the deductible calculation changes:
 *   deductible = total_paid - book_fmv - shipping_actual
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { DonationRow } from "@/lib/ledger";

function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100
  );
}

interface Props {
  donation: DonationRow;
}

export function DonationReceiptEmail({ donation }: Props) {
  const ein = process.env.FCG_EIN ?? "[EIN NOT CONFIGURED — DO NOT SEND]";
  const orgName = process.env.FCG_LEGAL_NAME ?? "Futures Church Global";
  const orgAddress = process.env.FCG_ADDRESS ?? "[ADDRESS NOT CONFIGURED]";
  const orderRef = donation.stripe_payment_intent_id.slice(-8).toUpperCase();
  const donorName = donation.customer_name ?? donation.customer_email;
  const donationDate = new Date(donation.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Deductible = donation line item (3-line-item model)
  // In 2-line-item model: deductible = donation_amount_cents (same result if donation is its own line item)
  const deductibleCents = donation.donation_amount_cents;
  const bookFmvCents = donation.book_fmv_cents;
  const shippingCents = donation.shipping_amount_cents;
  const totalFmvGoodsReceived = bookFmvCents + shippingCents;

  // Guard: don't send this email for zero-donation orders (lib/email.ts already checks this)
  if (deductibleCents === 0) return null;

  return (
    <Html lang="en">
      <Head />
      <Preview>Your tax receipt from {orgName} — {fmt(deductibleCents)} deductible donation</Preview>
      <Body style={{ backgroundColor: "#FBFAF6", fontFamily: "Georgia, serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <Section style={{ paddingBottom: "24px", borderBottom: "1px solid #EAE6D9" }}>
            <Text style={{ color: "#5D1FEC", fontFamily: "system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.24em", textTransform: "uppercase", margin: "0 0 8px" }}>
              {orgName}
            </Text>
            <Text style={{ color: "#6E6760", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
              {orgAddress}
              <br />
              EIN: {ein}
            </Text>
          </Section>

          {/* Title */}
          <Section style={{ padding: "32px 0" }}>
            <Heading style={{ color: "#1C1A17", fontSize: "22px", fontWeight: "normal", margin: "0 0 8px" }}>
              Charitable Contribution Receipt
            </Heading>
            <Text style={{ color: "#6E6760", fontSize: "14px", margin: 0 }}>
              Date: {donationDate} · Reference: #{orderRef}
            </Text>
          </Section>

          {/* Donor */}
          <Section style={{ backgroundColor: "#F6F4EE", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" }}>
            <Text style={{ color: "#6E6760", fontFamily: "system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 4px" }}>Donor</Text>
            <Text style={{ color: "#1C1A17", fontSize: "15px", margin: 0 }}>{donorName}</Text>
          </Section>

          {/* Payment breakdown */}
          <Section style={{ marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "system-ui, sans-serif" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#534D44", fontSize: "14px", paddingBottom: "10px" }}>Book — <em>Multiply or Die</em> (FMV)</td>
                  <td style={{ color: "#534D44", fontSize: "14px", paddingBottom: "10px", textAlign: "right" }}>{fmt(bookFmvCents)}</td>
                </tr>
                <tr>
                  <td style={{ color: "#534D44", fontSize: "14px", paddingBottom: "10px" }}>Shipping (FMV)</td>
                  <td style={{ color: "#534D44", fontSize: "14px", paddingBottom: "10px", textAlign: "right" }}>{fmt(shippingCents)}</td>
                </tr>
                <tr>
                  <td style={{ color: "#534D44", fontSize: "14px", paddingBottom: "10px" }}>Multiply It Forward donation</td>
                  <td style={{ color: "#534D44", fontSize: "14px", paddingBottom: "10px", textAlign: "right" }}>{fmt(deductibleCents)}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ borderTop: "1px solid #D6D0BD", paddingTop: "10px" }} />
                </tr>
                <tr>
                  <td style={{ color: "#1C1A17", fontSize: "15px", fontWeight: "bold", paddingBottom: "4px" }}>Total paid</td>
                  <td style={{ color: "#1C1A17", fontSize: "15px", fontWeight: "bold", paddingBottom: "4px", textAlign: "right" }}>
                    {fmt(deductibleCents + bookFmvCents + shippingCents)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Tax-deductible amount — highlighted */}
          <Section style={{ backgroundColor: "#5D1FEC", borderRadius: "12px", padding: "20px 24px", marginBottom: "32px" }}>
            <Text style={{ color: "rgba(246,244,238,0.7)", fontFamily: "system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 4px" }}>
              Tax-deductible contribution
            </Text>
            <Text style={{ color: "#F6F4EE", fontSize: "26px", fontWeight: "bold", fontFamily: "system-ui, sans-serif", margin: 0 }}>
              {fmt(deductibleCents)}
            </Text>
          </Section>

          {/* IRS-required disclosure language */}
          <Section style={{ marginBottom: "32px" }}>
            <Text style={{ color: "#534D44", fontSize: "13px", lineHeight: "1.7", margin: "0 0 16px" }}>
              In exchange for your donation, you received: one (1) hardback copy of{" "}
              <em>Multiply or Die</em> with a fair market value of {fmt(bookFmvCents)}, and{" "}
              shipping services with a fair market value of {fmt(shippingCents)}.{" "}
              The combined fair market value of goods received is {fmt(totalFmvGoodsReceived)}.
            </Text>
            <Text style={{ color: "#534D44", fontSize: "13px", lineHeight: "1.7", margin: "0 0 16px" }}>
              <strong>No goods or services were provided in exchange for this contribution beyond
              the items listed above.</strong>
            </Text>
            <Text style={{ color: "#534D44", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>
              Your tax-deductible contribution to {orgName}, a 501(c)(3) public charity
              (EIN: {ein}), is <strong>{fmt(deductibleCents)}</strong>. Please retain this letter
              as your official receipt for tax purposes.
            </Text>
          </Section>

          <Hr style={{ borderColor: "#EAE6D9", margin: "0 0 24px" }} />

          {/* Footer */}
          <Text style={{ color: "#8A8A94", fontSize: "12px", lineHeight: "1.6", margin: "0 0 8px" }}>
            {orgName} is a 501(c)(3) public charity. EIN: {ein}.
          </Text>
          <Text style={{ color: "#8A8A94", fontSize: "12px", lineHeight: "1.6", margin: "0 0 8px" }}>
            {orgAddress}
          </Text>
          <Text style={{ color: "#8A8A94", fontSize: "12px", lineHeight: "1.6", margin: 0 }}>
            Questions about this receipt: orders@multiplyordie.com
          </Text>

          <Hr style={{ borderColor: "#EAE6D9", margin: "24px 0" }} />

          <Text style={{ color: "#D6D0BD", fontSize: "11px", lineHeight: "1.5", margin: 0 }}>
            ⚠️ This receipt reflects information as of your transaction date. Consult a tax
            professional regarding deductibility. Deductions are subject to IRS limitations.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DonationReceiptEmail;
