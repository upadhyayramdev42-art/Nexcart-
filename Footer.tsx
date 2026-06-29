import Link from "next/link";
import { Zap, Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "New Arrivals", href: "/new" },
    { label: "Women", href: "/women" },
    { label: "Men", href: "/men" },
    { label: "Electronics", href: "/electronics" },
    { label: "Sale", href: "/sale" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Order Status", href: "/orders" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Contact Us", href: "/contact" },
    { label: "Size Guide", href: "/size-guide" },
  ],
  Company: [
    { label: "About NexCart", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Affiliate Program", href: "/affiliates" },
  ],
};

const socials = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Trust bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: "🚚", title: "Free Shipping", desc: "On orders over $75" },
            { icon: "🔄", title: "Easy Returns", desc: "30-day return policy" },
            { icon: "🔒", title: "Secure Checkout", desc: "SSL encrypted payments" },
            { icon: "💬", title: "24/7 Support", desc: "Live chat & email" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                Nex<span className="text-brand-400">Cart</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 mb-6 max-w-xs">
              A curated marketplace where premium products meet effortless discovery. Shop smarter, live better.
            </p>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-brand-500 shrink-0" />
                <span>hello@nexcart.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-brand-500 shrink-0" />
                <span>+1 (800) 639-2278</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-brand-500 shrink-0" />
                <span>San Francisco, CA 94102</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-700 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} className="text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white text-sm font-semibold mb-4 tracking-wide">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-brand-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} NexCart, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-gray-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
