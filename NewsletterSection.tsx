"use client";

import { useState, type FormEvent } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-brand-950 via-brand-900 to-indigo-950 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        {/* Icon */}
        <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600/30 border border-brand-500/30 items-center justify-center mb-6">
          <Mail size={24} className="text-brand-300" />
        </div>

        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
          Get 15% off your first order
        </h2>
        <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
          Join 180,000+ shoppers. Be the first to know about new arrivals, exclusive deals, and style inspiration.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-3 text-emerald-400 font-semibold text-lg animate-fade-in">
            <CheckCircle size={22} />
            <span>You&apos;re in! Check your inbox for your discount code.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-400 focus:bg-white/15 transition-all"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-70 text-white font-semibold px-6 py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-500/30 whitespace-nowrap text-sm"
            >
              {status === "loading" ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Subscribe <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-white/30 text-xs mt-4">
          No spam, ever. Unsubscribe in one click.
        </p>
      </div>
    </section>
  );
}
