import { Body, Container, Head, Html, Preview, Text, Heading, Hr } from "@react-email/components";

interface Props {
  firstName?: string;
}

export function Drip10Finale({ firstName = "Pastor" }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>You finished the Masterclass. Now what?</Preview>
      <Body style={{ backgroundColor: "#050506", fontFamily: "Georgia, serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>
          <Text style={{ color: "#C8A65A", fontFamily: "system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.24em", textTransform: "uppercase", margin: "0 0 24px" }}>
            Multiplication Masterclass · Final Session
          </Text>
          <Heading style={{ color: "#F6F4EE", fontSize: "26px", fontWeight: "normal", margin: "0 0 20px" }}>
            You made it, {firstName}.
          </Heading>
          <Text style={{ color: "rgba(246,244,238,0.7)", fontSize: "15px", lineHeight: "1.75", margin: "0 0 20px" }}>
            Ten sessions. Ninety days to put them into practice. Most pastors will read a book
            and do nothing. You&rsquo;re not most pastors.
          </Text>
          <Text style={{ color: "rgba(246,244,238,0.7)", fontSize: "15px", lineHeight: "1.75", margin: "0 0 20px" }}>
            The next step — if you&rsquo;re serious about making multiplication a core practice
            in your church — is the Futures College coaching program.
          </Text>
          <Text style={{ color: "rgba(246,244,238,0.7)", fontSize: "15px", lineHeight: "1.75", margin: "0 0 32px" }}>
            Applications are open. They&rsquo;re not for everyone. If you&rsquo;re ready, you&rsquo;ll know.
          </Text>
          <a
            href="https://futurescollege.com/apply"
            style={{
              display: "inline-block",
              backgroundColor: "#5D1FEC",
              color: "#F6F4EE",
              fontFamily: "system-ui, sans-serif",
              fontWeight: "bold",
              fontSize: "15px",
              padding: "14px 28px",
              borderRadius: "50px",
              textDecoration: "none",
            }}
          >
            Apply for Futures College →
          </a>
          <Hr style={{ borderColor: "#26262C", margin: "32px 0" }} />
          <Text style={{ color: "rgba(246,244,238,0.3)", fontSize: "12px" }}>
            You are receiving this because you ordered <em>Multiply or Die</em>.{" "}
            <a href="{{unsubscribe_url}}" style={{ color: "rgba(246,244,238,0.4)" }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default Drip10Finale;
