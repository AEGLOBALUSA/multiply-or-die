import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface Endorser {
  name: string;
  title: string;
  church: string;
  quote: string;
  avatarSrc: string;
}

// Placeholder data — replace with real endorsers before launch
const ENDORSERS: Endorser[] = [
  {
    name: "Pastor Name",
    title: "Lead Pastor",
    church: "Church Name",
    quote: "Ashley Evans challenges every church leader to confront the plateau and choose multiplication.",
    avatarSrc: "/images/endorsers/placeholder.jpg",
  },
  {
    name: "Pastor Name",
    title: "Senior Pastor",
    church: "Church Name",
    quote: "This book reframes the entire conversation about church growth. Every pastor needs to read it.",
    avatarSrc: "/images/endorsers/placeholder.jpg",
  },
  {
    name: "Pastor Name",
    title: "Founding Pastor",
    church: "Church Name",
    quote: "Multiply or Die is the most honest book about church health I have read in a decade.",
    avatarSrc: "/images/endorsers/placeholder.jpg",
  },
  {
    name: "Pastor Name",
    title: "Lead Pastor",
    church: "Church Name",
    quote: "Ashley writes with the authority of someone who has actually done what she is calling us to do.",
    avatarSrc: "/images/endorsers/placeholder.jpg",
  },
  {
    name: "Pastor Name",
    title: "Senior Leader",
    church: "Church Name",
    quote: "A clear, convicting, and catalytic read for any pastor serious about legacy.",
    avatarSrc: "/images/endorsers/placeholder.jpg",
  },
];

export function EndorserCards() {
  return (
    <Section
      eyebrow="What pastors are saying"
      headline="From leaders who refuse to plateau"
      tone="darker"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {ENDORSERS.map((endorser) => (
          <Card key={endorser.name} className="p-6 flex flex-col gap-5">
            <blockquote>
              <p className="font-body text-bone/80 text-sm leading-relaxed">
                &ldquo;{endorser.quote}&rdquo;
              </p>
            </blockquote>
            <div className="flex items-center gap-3 mt-auto">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-obsidian-600 flex-shrink-0">
                <Image
                  src={endorser.avatarSrc}
                  alt={endorser.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="font-sans font-semibold text-bone text-xs">{endorser.name}</p>
                <p className="font-sans text-bone/50 text-xs">{endorser.title}, {endorser.church}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
