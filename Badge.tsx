import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "new" | "sale" | "hot" | "limited";
  className?: string;
}

const variantMap: Record<BadgeProps["variant"], string> = {
  new: "bg-emerald-500 text-white",
  sale: "bg-rose-500 text-white",
  hot: "bg-orange-500 text-white",
  limited: "bg-brand-600 text-white",
};

const labelMap: Record<BadgeProps["variant"], string> = {
  new: "New",
  sale: "Sale",
  hot: "🔥 Hot",
  limited: "Limited",
};

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wide uppercase",
        variantMap[variant],
        className
      )}
    >
      {labelMap[variant]}
    </span>
  );
}
