import { Body, Container, Head, Html, Preview, Text, Heading, Hr } from "@react-email/components";

interface Props {
  firstName?: string;
}

export function Drip01Welcome({ firstName = "Pastor" }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to the Multiplication Masterclass — Day 1</Preview>
      <Body style={{ backgroundColor: "#050506", fontFamily: "Georgia, serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>
          <Text style={{ color: "#C8A65A", fontFamily: "system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.24em", textTransform: "uppercase", margin: "0 0 24px" }}>
            Multiplication Masterclass · Session 1
          </Text>
          <Heading style={{ color: "#F6F4EE", fontSize: "26px", fontWeight: "normal", margin: "0 0 20px" }}>
            Welcome, {firstName}.
          </Heading>
          <Text style={{ color: "rgba(246,244,238,0.7)", fontSize: "15px", lineHeight: "1.75", margin: "0 0 20px" }}>
            Over the next 14 days, you will receive 10 sessions from Ashley Evans — built
            directly from the principles in <em>Multiply or Die</em>. Each one is short,
            direct, and designed to be applied immediately.
          </Text>
          <Text style={{ color: "rgba(246,244,238,0.7)", fontSize: "15px", lineHeight: "1.75", margin: "0 0 20px" }}>
            Today&rsquo;s assignment: before the book arrives, answer this one question in writing —
          </Text>
          <Text style={{ color: "#F6F4EE", fontSize: "16px", fontStyle: "italic", lineHeight: "1.7", margin: "0 0 32px", paddingLeft: "24px", borderLeft: "2px solid #5D1FEC" }}>
            &ldquo;What would it mean for my church to stop multiplying — and have I already started down that road?&rdquo;
          </Text>
          <Hr style={{ borderColor: "#26262C", margin: "24px 0" }} />
          <Text style={{ color: "rgba(246,244,238,0.3)", fontSize: "12px" }}>
            You are receiving this because you ordered <em>Multiply or Die</em>.{" "}
            <a href="{{unsubscribe_url}}" style={{ color: "rgba(246,244,238,0.4)" }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default Drip01Welcome;
