import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex gap-6">
            <CustomerSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </AuthGuard>
  );
}
