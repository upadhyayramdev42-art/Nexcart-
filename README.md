# NexCart — Module 02

A production-ready ecommerce platform built with Next.js 15, TypeScript, Tailwind CSS, and Firebase.

## ✨ What's included

### Module 01 (Storefront)
- Responsive homepage with Hero, Featured Categories, Trending Products, Newsletter
- Professional Header with search, cart, wishlist, dark/light mode
- Professional Footer with trust bar, social links, sitemap

### Module 02 (Auth + Admin + Customer)
- **Authentication** — Login, Register, Forgot Password, Email Verification, Persistent Login
- **User Roles** — Admin & Customer stored in Firestore
- **Admin Panel** — Full sidebar dashboard with:
  - Dashboard with KPI stats and recent orders
  - My Products (CRUD)
  - Dropshipping Products (read-only, supplier-imported)
  - Add Product with image upload to Firebase Storage
  - Categories management
  - Orders management with status updates
  - Customers management with role control
  - Suppliers page (Baap Store, Meesho, Udaan, IndiaMART, TradeIndia, CJ Dropshipping, AliExpress)
  - Reports with revenue chart
  - Settings
- **Customer Panel** — Profile, Wishlist, Orders, Addresses

## 🚀 Getting Started

### 1. Clone
```bash
git clone https://github.com/yourusername/nexcart.git
cd nexcart
```

### 2. Install
```bash
npm install
```

### 3. Environment variables
```bash
cp .env.example .env.local
# Fill in your Firebase values
```

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project
3. Enable **Authentication** (Email/Password provider)
4. Enable **Firestore Database**
5. Enable **Storage**
6. Go to **Project Settings → General → Your apps** → Add Web App
7. Copy config values into `.env.local`

### Firestore Collections (auto-created on first write)
| Collection | Description |
|---|---|
| `users` | uid, name, email, role, emailVerified, createdAt |
| `my_products` | Admin-owned products |
| `dropshipping_products` | Supplier-imported products |
| `suppliers` | Supplier status and metadata |
| `orders` | Customer orders |
| `categories` | Product categories |
| `settings` | Store configuration |

### First Admin User
After registering, manually set `role: "admin"` in Firestore for your user document to access the admin panel at `/dashboard`.

## 📁 Project Structure

```
nexcart/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Register, Forgot Password, Verify Email
│   │   ├── (admin)/             # Admin panel (dashboard, products, orders, etc.)
│   │   ├── (customer)/          # Customer panel (profile, wishlist, orders, addresses)
│   │   ├── layout.tsx           # Root layout — ThemeProvider + AuthProvider
│   │   └── page.tsx             # Storefront homepage
│   ├── components/
│   │   ├── admin/layout/        # AdminSidebar, AdminTopbar
│   │   ├── admin/dashboard/     # StatCard, RecentOrdersTable
│   │   ├── auth/                # AuthGuard
│   │   ├── customer/            # CustomerSidebar
│   │   ├── home/                # HeroBanner, FeaturedCategories, TrendingProducts, etc.
│   │   ├── layout/              # Header, Footer
│   │   ├── shared/              # ThemeToggle, SearchBar
│   │   └── ui/                  # Button, Badge, StarRating
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth state (firebaseUser + appUser)
│   ├── data/                    # Dummy data for storefront
│   ├── hooks/                   # useCart, useWishlist
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts        # Firebase init
│   │   │   ├── auth.ts          # Auth service (register, login, logout, etc.)
│   │   │   ├── firestore.ts     # Firestore service layer
│   │   │   └── storage.ts       # Firebase Storage helpers
│   │   └── utils/               # cn(), formatCurrency(), calculateDiscount()
│   ├── middleware.ts             # Route protection
│   └── types/                   # All TypeScript interfaces
├── .env.example
├── .gitignore
├── README.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## 🛠 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all `NEXT_PUBLIC_FIREBASE_*` env vars in Vercel dashboard
4. Deploy

## 🗺 Roadmap

| Module | Status |
|---|---|
| Module 01 — Storefront | ✅ Done |
| Module 02 — Auth + Admin + Products | ✅ Done |
| Module 03 — Baap Store API + CSV Import | 🔜 Next |
| Module 04 — Cart + Checkout + Payments | 🔜 Planned |
| Module 05 — SEO + Performance + PWA | 🔜 Planned |

## 📄 License

MIT © NexCart

## Module 03 — Universal Supplier Engine

### New Pages Added
| Page | Route |
|---|---|
| Supplier Connections | `/supplier-connections` |
| Supplier Products | `/supplier-products` |
| CSV Imports | `/csv-imports` |
| API Connections | `/api-connections` |
| Profit Rules | `/profit-rules` |
| Import History | `/import-history` |
| Sync History | `/sync-history` |

### New Collections (Firestore)
`suppliers` · `supplier_products` · `csv_imports` · `api_connections` · `profit_rules` · `supplier_logs` · `sync_history` · `scheduler_jobs`

### New Features
- Universal CSV Import Wizard (drag & drop, column mapping, preview, bulk import)
- REST API Connector (GET/POST/PUT/PATCH/DELETE, bearer/API key auth, pagination, retry)
- Profit Rules Engine (global/supplier/category, fixed/percentage, live preview)
- Supplier Products table (bulk publish/unpublish/delete, export CSV, pagination)
- Import History with error report download
- Sync History with duration tracking
- Toast notification system
- Skeleton loaders, Empty states, Pagination, ConfirmDialog reusable components

### Architecture Ready For
Baap Store · Meesho · Udaan · IndiaMART · TradeIndia · CJ Dropshipping · AliExpress · Spocket · Zendrop · HyperSKU · Printful · Printify
