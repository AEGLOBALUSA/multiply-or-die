import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "font-sans font-semibold text-eyebrow uppercase tracking-[0.24em] text-violet",
        className
      )}
    >
      {children}
    </p>
  );
}
