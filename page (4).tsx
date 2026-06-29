"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, RefreshCw } from "lucide-react";
import { resendVerificationEmail, logoutUser } from "@/lib/firebase/auth";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await resendVerificationEmail();
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
      <div className="w-20 h-20 rounded-3xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-6">
        <MailCheck size={36} className="text-brand-400" />
      </div>

      <h1 className="font-display text-3xl font-bold text-white mb-3">Verify your email</h1>
      <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">
        We sent a verification link to your email address. Click the link to activate your account.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {resent && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
          Verification email resent!
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold py-3 rounded-xl transition-all text-sm"
        >
          <RefreshCw size={15} className={resending ? "animate-spin" : ""} />
          {resending ? "Sending…" : "Resend verification email"}
        </button>

        <button
          onClick={() => logoutUser()}
          className="w-full text-white/40 hover:text-white/70 text-sm py-2 transition-colors"
        >
          Sign in with a different account
        </button>
      </div>

      <p className="mt-6 text-xs text-white/30">
        Once verified, <Link href="/login" className="text-brand-400 hover:text-brand-300">sign in here</Link>
      </p>
    </div>
  );
}
