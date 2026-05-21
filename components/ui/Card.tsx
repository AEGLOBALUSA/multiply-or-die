import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ glass = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        glass
          ? "backdrop-blur-glass bg-bone/5 border-bone/10 animate-glass-breathe"
          : "bg-obsidian-700 border-obsidian-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
