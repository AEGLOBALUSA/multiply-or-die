import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
  container?: boolean;
  eyebrow?: string;
  headline?: string;
  tone?: "dark" | "darker" | "light";
}

export function Section({
  as: Tag = "section",
  container = true,
  eyebrow,
  headline,
  tone = "dark",
  className,
  children,
  ...props
}: SectionProps) {
  const toneClass =
    tone === "darker"
      ? "bg-obsidian-800 text-bone"
      : tone === "light"
        ? "bg-bone text-obsidian-900"
        : "bg-obsidian-900 text-bone";

  return (
    <Tag className={cn("py-24 md:py-40", toneClass, className)} {...props}>
      {container ? (
        <div className="mx-auto max-w-display px-6 sm:px-12 lg:px-20">
          {(eyebrow || headline) && (
            <div className="mb-16 max-w-display">
              {eyebrow && (
                <p className="font-sans font-medium text-eyebrow uppercase tracking-[0.24em] mb-5 text-bone/60">
                  {eyebrow}
                </p>
              )}
              {headline && (
                <h2 className="font-display text-display-lg leading-[1.05] tracking-[-0.015em] text-balance">
                  {headline}
                </h2>
              )}
            </div>
          )}
          {children}
        </div>
      ) : (
        children
      )}
    </Tag>
  );
}
