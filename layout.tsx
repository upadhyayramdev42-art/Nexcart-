import Link from "next/link";
import { Zap } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-indigo-950 to-gray-950 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            Nex<span className="text-brand-400">Cart</span>
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} NexCart. All rights reserved.
      </footer>
    </div>
  );
}
