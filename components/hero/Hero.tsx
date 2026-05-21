import Image from "next/image";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <header className="relative min-h-screen flex items-center bg-obsidian-900 overflow-hidden">
      {/* Background aurora */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-violet/10 blur-[120px] animate-aurora" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-gold/8 blur-[100px] animate-aurora" style={{ animationDelay: "-9s" }} />
      </div>

      <div className="relative mx-auto max-w-shell px-6 sm:px-12 lg:px-20 py-24 md:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div className="space-y-8 order-2 lg:order-1">
            <Eyebrow>A book by Ashley Evans</Eyebrow>

            <h1 className="font-display text-display-xl text-bone text-balance leading-[0.95]">
              Multiply<br />
              <em className="not-italic text-gold">or Die.</em>
            </h1>

            <p className="font-sans text-body-lg text-bone/70 max-w-prose text-balance">
              The church that stops multiplying has chosen its own ending. This book is for pastors who refuse to plateau.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#order-form"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold text-obsidian-900 font-sans font-bold text-lg min-h-[52px] hover:bg-gold-light transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-900"
              >
                Get the Book Free →
              </a>
              <a
                href="#vsl"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent border border-bone/20 text-bone font-sans font-medium text-lg min-h-[52px] hover:bg-bone/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-900"
              >
                Watch the story
              </a>
            </div>

            <p className="font-sans text-sm text-bone/40">
              Free hardback · You pay shipping · Tax-deductible donation optional
            </p>
          </div>

          {/* Book cover */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[340px] lg:w-[400px] aspect-[2/3]">
              <Image
                src="/images/book-cover.jpg"
                alt="Multiply or Die — hardback book by Ashley Evans"
                fill
                priority
                className="object-contain drop-shadow-[0_40px_80px_rgba(200,166,90,0.25)]"
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 400px"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
