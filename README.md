# NexCart — Module 01

A premium, production-ready ecommerce platform built with Next.js 15, TypeScript, Tailwind CSS, and Firebase.

## ✨ Features

- **Next.js 15 App Router** — File-based routing with React Server Components
- **TypeScript** — Fully typed codebase with strict mode
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **Dark / Light Mode** — System-aware with manual toggle via `next-themes`
- **Firebase Ready** — Auth, Firestore, and Storage pre-configured via env vars
- **Responsive Design** — Mobile-first, tested across breakpoints
- **Reusable Components** — Clean component architecture with shared UI primitives
- **GitHub Ready** — `.gitignore`, proper project structure
- **Vercel Ready** — `vercel.json` and env-var-only config

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/nexcart.git
cd nexcart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase project values from the [Firebase Console](https://console.firebase.google.com).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔥 Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication**, **Firestore**, and **Storage**
3. Go to **Project Settings → General → Your apps** → Add a Web App
4. Copy the config values into your `.env.local`

## 📁 Project Structure

```
nexcart/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout with ThemeProvider
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── layout/           # Header, Footer
│   │   ├── home/             # Page-specific sections
│   │   ├── ui/               # Reusable primitives (Button, Badge, etc.)
│   │   └── shared/           # ThemeToggle, SearchBar, etc.
│   ├── data/                 # Dummy/seed data
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── firebase/         # Firebase init & service modules
│   │   └── utils/            # cn(), formatCurrency(), etc.
│   └── types/                # TypeScript interfaces
├── public/                   # Static assets
├── .env.example
├── .gitignore
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
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript type check |

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import the repo in [vercel.com/new](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard
4. Deploy

## 📄 License

MIT © NexCart
