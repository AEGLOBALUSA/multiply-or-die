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

export function OrderConfirmationEmail({ donation }: Props) {
  const orderRef = donation.stripe_payment_intent_id.slice(-8).toUpperCase();
  const firstName = donation.customer_name?.split(" ")[0] ?? "Pastor";
  const shippingLabel =
    donation.shipping_option === "priority" ? "Priority (2–3 business days)" : "Standard (5–7 business days)";

  return (
    <Html lang="en">
      <Head />
      <Preview>Your copy of Multiply or Die is confirmed — Order #{orderRef}</Preview>
      <Body style={{ backgroundColor: "#050506", fontFamily: "Georgia, serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <Section style={{ paddingBottom: "32px" }}>
            <Text style={{ color: "#C8A65A", fontFamily: "system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.24em", textTransform: "uppercase", margin: 0 }}>
              Multiply or Die
            </Text>
          </Section>

          {/* Greeting */}
          <Heading style={{ color: "#F6F4EE", fontSize: "28px", fontWeight: "normal", margin: "0 0 16px" }}>
            You&rsquo;re in, {firstName}.
          </Heading>
          <Text style={{ color: "rgba(246,244,238,0.6)", fontSize: "16px", lineHeight: "1.6", margin: "0 0 32px" }}>
            Your order is confirmed. Here&rsquo;s what you need to know.
          </Text>

          {/* Order summary */}
          <Section style={{ backgroundColor: "#141417", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
            <Text style={{ color: "rgba(246,244,238,0.5)", fontFamily: "system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 16px" }}>
              Order #{orderRef}
            </Text>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ color: "rgba(246,244,238,0.6)", fontSize: "14px", paddingBottom: "8px" }}>Multiply or Die (hardback)</td>
                  <td style={{ color: "rgba(246,244,238,0.6)", fontSize: "14px", paddingBottom: "8px", textAlign: "right" }}>Free</td>
                </tr>
                <tr>
                  <td style={{ color: "rgba(246,244,238,0.6)", fontSize: "14px", paddingBottom: "8px" }}>Shipping ({shippingLabel})</td>
                  <td style={{ color: "rgba(246,244,238,0.6)", fontSize: "14px", paddingBottom: "8px", textAlign: "right" }}>{fmt(donation.shipping_amount_cents)}</td>
                </tr>
                {donation.donation_amount_cents > 0 && (
                  <tr>
                    <td style={{ color: "#5D1FEC", fontSize: "14px", paddingBottom: "8px" }}>Multiply It Forward donation</td>
                    <td style={{ color: "#5D1FEC", fontSize: "14px", paddingBottom: "8px", textAlign: "right" }}>{fmt(donation.donation_amount_cents)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2} style={{ borderTop: "1px solid #26262C", paddingTop: "8px" }} />
                </tr>
                <tr>
                  <td style={{ color: "#F6F4EE", fontSize: "15px", fontWeight: "bold" }}>Total</td>
                  <td style={{ color: "#F6F4EE", fontSize: "15px", fontWeight: "bold", textAlign: "right" }}>
                    {fmt(donation.shipping_amount_cents + donation.donation_amount_cents)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Next steps */}
          <Text style={{ color: "#F6F4EE", fontSize: "15px", fontWeight: "bold", margin: "0 0 12px" }}>What happens next</Text>
          <Text style={{ color: "rgba(246,244,238,0.7)", fontSize: "14px", lineHeight: "1.7", margin: "0 0 8px" }}>
            1. Your book ships within 2–3 business days. You&rsquo;ll receive a tracking email when it&rsquo;s on the way.
          </Text>
          <Text style={{ color: "rgba(246,244,238,0.7)", fontSize: "14px", lineHeight: "1.7", margin: "0 0 8px" }}>
            2. Your Multiplication Masterclass begins tomorrow — 10 sessions over the next two weeks, straight to your inbox.
          </Text>
          {donation.donation_amount_cents > 0 && (
            <Text style={{ color: "rgba(246,244,238,0.7)", fontSize: "14px", lineHeight: "1.7", margin: "0 0 8px" }}>
              3. Your tax receipt will arrive in a separate email from Futures Church Global. Keep it for your records.
            </Text>
          )}

          <Hr style={{ borderColor: "#26262C", margin: "32px 0" }} />

          {/* Footer */}
          <Text style={{ color: "rgba(246,244,238,0.3)", fontSize: "12px", lineHeight: "1.6" }}>
            Questions? Email orders@multiplyordie.com
          </Text>
          <Text style={{ color: "rgba(246,244,238,0.3)", fontSize: "12px", lineHeight: "1.6" }}>
            Futures Church Global · {process.env.FCG_ADDRESS ?? ""}
            {process.env.FCG_EIN ? ` · EIN: ${process.env.FCG_EIN}` : ""}
          </Text>
          <Text style={{ color: "rgba(246,244,238,0.2)", fontSize: "11px", marginTop: "8px" }}>
            You are receiving this because you ordered a copy of Multiply or Die.{" "}
            <a href="{{unsubscribe_url}}" style={{ color: "rgba(246,244,238,0.3)" }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmationEmail;
