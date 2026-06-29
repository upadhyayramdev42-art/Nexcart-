import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "fill-current",
              size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
              i < Math.floor(rating)
                ? "text-accent"
                : i < rating
                ? "text-accent opacity-60"
                : "text-gray-300 dark:text-gray-600"
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "font-medium text-gray-600 dark:text-gray-400",
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span
          className={cn(
            "text-gray-400 dark:text-gray-500",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
