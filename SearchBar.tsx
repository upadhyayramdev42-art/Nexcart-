"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  className,
  placeholder = "Search products, brands and categories…",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") handleClear();
  };

  return (
    <div
      className={cn(
        "relative flex items-center group",
        className
      )}
    >
      <Search
        size={16}
        className="absolute left-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors pointer-events-none"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full pl-10 pr-9 py-2.5 rounded-xl text-sm",
          "bg-gray-100 dark:bg-gray-800",
          "text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500",
          "border border-transparent focus:border-brand-400 dark:focus:border-brand-500",
          "focus:bg-white dark:focus:bg-gray-900",
          "outline-none transition-all duration-200",
          "focus:ring-2 focus:ring-brand-500/20"
        )}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
