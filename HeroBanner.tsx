import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

const perks = [
  { icon: ShieldCheck, text: "Secure payments" },
  { icon: Truck, text: "Free shipping $75+" },
  { icon: RotateCcw, text: "30-day returns" },
];

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[580px] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-900/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-900/10 rounded-full blur-3xl" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 md:py-28">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
            Summer Collection 2026 — Now Live
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 animate-slide-up">
            Shop Without{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-light">
                Limits
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5C40 1.5 80 1.5 100 3.5C120 5.5 160 6.5 199 4.5"
                  stroke="url(#gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="#e879f9" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl animate-slide-up">
            Discover thousands of premium products across fashion, electronics, home & beauty — all curated for you.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-12 animate-slide-up">
            <Link href="/shop">
              <Button size="lg" className="group">
                Shop Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/new">
              <button className="flex items-center gap-2 text-white/90 hover:text-white font-semibold text-base transition-colors group">
                New Arrivals
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Perks */}
          <div className="flex flex-wrap items-center gap-5 animate-fade-in">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/60 text-sm">
                <Icon size={15} className="text-brand-300" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="absolute right-6 bottom-8 hidden lg:grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10">
          {[
            { num: "2M+", label: "Products" },
            { num: "180K+", label: "Customers" },
            { num: "4.9★", label: "Rating" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="px-6 py-4 text-center bg-white/5 hover:bg-white/10 transition-colors"
            >
              <p className="text-white text-xl font-bold font-display">{stat.num}</p>
              <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
