"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ember" | "ghost" | "lemon" | "gold";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   "bg-bone text-obsidian-900 hover:bg-lemon hover:text-obsidian-900 border border-transparent",
  secondary: "bg-transparent text-bone border border-bone/30 hover:border-bone hover:bg-bone/5",
  ember:     "bg-violet text-bone hover:bg-violet-600 border border-transparent",
  ghost:     "bg-transparent text-bone border border-transparent hover:bg-bone/5",
  lemon:     "bg-lemon text-obsidian-900 hover:brightness-95 border border-transparent",
  gold:      "bg-gold text-obsidian-900 hover:bg-gold-light border border-transparent",
};

const sizes = {
  sm: "px-4 py-2 text-sm min-h-[44px]",
  md: "px-6 py-3 text-base min-h-[44px]",
  lg: "px-8 py-4 text-lg min-h-[52px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium",
        "transition-all duration-200 ease-apple",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  )
);

Button.displayName = "Button";
