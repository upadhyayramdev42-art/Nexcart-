import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NexCart — Shop Without Limits",
    template: "%s | NexCart",
  },
  description:
    "A curated marketplace where premium products meet effortless discovery. Shop fashion, electronics, home & beauty.",
  keywords: ["ecommerce", "shopping", "fashion", "electronics", "nexcart"],
  authors: [{ name: "NexCart" }],
  creator: "NexCart",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexcart.vercel.app",
    siteName: "NexCart",
    title: "NexCart — Shop Without Limits",
    description:
      "A curated marketplace where premium products meet effortless discovery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexCart — Shop Without Limits",
    description:
      "A curated marketplace where premium products meet effortless discovery.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
