import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

const COLUMNS = [
  {
    title: "You get the book free",
    body:
      "Multiply or Die ships to your door at no cost. Pay only the cost to ship it to you. That's it.",
    icon: "📖",
  },
  {
    title: "Your donation sponsors a pastor",
    body:
      "Add a donation above the shipping cost. Every $20 sponsors one pastor to access the same leadership resources you're receiving — completely free to them.",
    icon: "✦",
  },
  {
    title: "The mission multiplies",
    body:
      "Futures Church Global distributes these resources to pastors in communities where cost would otherwise be a barrier. Your generosity multiplies their impact.",
    icon: "🌍",
  },
];

export function MultiplyForward() {
  const ein = process.env.FCG_EIN;
  const legalName = process.env.FCG_LEGAL_NAME ?? "Futures Church Global";

  return (
    <Section
      eyebrow="Multiply It Forward"
      headline="How it works"
      tone="dark"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {COLUMNS.map((col) => (
          <Card key={col.title} className="p-8 space-y-4">
            <span className="text-3xl" role="img" aria-label={col.title}>
              {col.icon}
            </span>
            <h3 className="font-display text-display-md text-bone">{col.title}</h3>
            <p className="font-body text-bone/70 text-sm leading-relaxed">{col.body}</p>
          </Card>
        ))}
      </div>

      {/* Legal disclosure */}
      <p className="text-center font-sans text-xs text-bone/30 max-w-prose mx-auto">
        {legalName} is a 501(c)(3) public charity.
        {ein ? ` EIN: ${ein}.` : ""}
        {" "}Donations above shipping are tax-deductible to the extent permitted by law.
        The book (FMV: $24.99) and shipping are not tax-deductible.
        You will receive a donation receipt by email after your order is processed.
      </p>
    </Section>
  );
}
