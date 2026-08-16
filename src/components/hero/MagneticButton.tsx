import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function MagneticButton({
  children,
  variant = "solid",
  className,
}: {
  children: ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate3d(${x * 0.25}px, ${y * 0.35}px, 0)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
      }}
      className={cn(
        "relative rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] transition-[background,box-shadow,color] duration-500 will-change-transform",
        variant === "solid"
          ? "bg-primary text-primary-foreground shadow-[var(--shadow-ember)] hover:shadow-[var(--glow-strong)]"
          : "border border-border/70 bg-card/40 text-foreground backdrop-blur-xl hover:border-primary/60 hover:text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}
