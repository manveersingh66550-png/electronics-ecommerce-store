# NexCart — Premium Electronics E-Commerce Store

A modern, full-stack e-commerce platform built with **Next.js 16**, **React 19**, **Supabase**, and **Zustand**. Featuring a premium "liquid glass" design aesthetic, comprehensive admin dashboard, and production-ready architecture.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61dafb?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)

---

## ✨ Features

- 🛍️ **Product Catalog** — Browse, search, and filter electronics by category, price, and brand
- 🎨 **Product Variants** — Color, storage, and size options with per-variant pricing
- 🛒 **Cart System** — Persistent cart with coupon support and stock validation
- 💳 **Multi-Step Checkout** — 3-step wizard: Shipping → Delivery → Payment
- 📦 **Order Tracking** — Real-time order status updates
- ❤️ **Wishlist** — Save favorites with one-click toggle
- ⭐ **Reviews & Ratings** — Star-based ratings with admin moderation
- 🎫 **Deals & Coupons** — Percentage/fixed discounts with minimum cart values
- 👤 **User Dashboard** — Order history, saved addresses, profile settings
- 🔐 **Authentication** — Email/password + Google OAuth via Supabase Auth
- 📊 **Admin Panel** — Full dashboard with product CRUD, orders, customers, reviews, messages, and store settings
- 📱 **Fully Responsive** — Optimized for desktop, tablet, and mobile
- 🔍 **SEO Optimized** — Dynamic sitemap, robots.txt, OpenGraph, and Twitter cards

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **UI** | React 19, CSS Modules, Framer Motion |
| **State** | Zustand (6 stores, LocalStorage persistence) |
| **Database** | PostgreSQL via Supabase |
| **Auth** | Supabase Auth (Email + Google OAuth) |
| **Storage** | Supabase Storage (product images, avatars) |
| **Icons** | Lucide React |
| **Font** | Inter (Google Fonts) |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ (comes with Node.js)
- A **Supabase** project ([create one free](https://supabase.com))
- **Git** installed

### 1. Clone the Repository

```bash
git clone https://github.com/manveersingh66550-png/electronics-ecommerce-store.git
cd electronics-ecommerce-store
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> You can find your Supabase URL and anon key in your [Supabase Dashboard](https://app.supabase.com) → Project Settings → API.

### 4. Set Up the Database

Run the following in the **Supabase SQL Editor** to create the required tables:

- `profiles` — User profiles with roles
- `products` — Product catalog with variants (JSONB)
- `categories` — Product categories
- `orders` — Customer orders
- `order_items` — Order line items
- `reviews` — Product reviews
- `coupons` — Discount coupons
- `addresses` — Saved user addresses
- `store_settings` — Tax rate, free shipping threshold
- `contact_messages` — Contact form submissions
- `wishlists` — User wishlists

> Refer to `DOCUMENTATION.md` for the complete database schema.

### 5. Configure Supabase Auth

1. Go to **Supabase Dashboard → Authentication → Providers**
2. Enable **Email** (enabled by default)
3. Enable **Google** and add your OAuth client ID and secret
4. Set the redirect URL to `http://localhost:3000/auth/callback`

### 6. Create Storage Buckets

In the **Supabase Dashboard → Storage**:

1. Create a bucket named `product-images` (set to **public**)
2. Create a bucket named `avatars` (set to **public**)

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/                      # Pages (Next.js App Router)
│   ├── admin/                # Admin dashboard (protected)
│   ├── user/                 # User dashboard (protected)
│   ├── shop/                 # Product browsing
│   ├── product/[id]/         # Product detail pages
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Multi-step checkout
│   ├── login/ signup/        # Authentication
│   └── ...                   # About, contact, FAQ, deals, etc.
│
├── components/
│   ├── home/                 # Homepage sections
│   ├── ecommerce/            # Cart, ProductCard, Gallery, Reviews
│   ├── layout/               # Navbar, Footer, MobileDrawer
│   ├── ui/                   # GlassPanel, Button, Input, Toast
│   └── providers/            # AuthProvider
│
├── store/                    # Zustand state stores
│   ├── cartStore.ts          # Cart state (persisted)
│   ├── wishlistStore.ts      # Wishlist state (persisted)
│   ├── userStore.ts          # Auth user state
│   ├── uiStore.ts            # UI toggles (cart drawer, menus)
│   ├── toastStore.ts         # Toast notifications
│   └── recentlyViewedStore.ts
│
├── lib/supabase/             # Supabase clients
│   ├── client.ts             # Browser client
│   ├── server.ts             # Server client
│   └── middleware.ts         # Session + route protection
│
└── middleware.ts              # Next.js middleware entry
```

---

## 🔐 Authentication & Authorization

| Role | Access |
|---|---|
| **Guest** | Browse, search, cart, wishlist |
| **User** | + Checkout, orders, profile, addresses, reviews |
| **Admin** | + Admin dashboard, product CRUD, order management |

Routes `/user/*`, `/admin/*`, and `/checkout` are protected by middleware. Admin routes additionally require `role: 'admin'` in the `profiles` table.

---

## 🚢 Deployment

This project is configured for **Vercel**:

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com/new)
3. Add your environment variables in Vercel → Project Settings → Environment Variables
4. Deploy — Vercel auto-builds and deploys on every push to `main`

---

## 📖 Documentation

A comprehensive technical documentation file is available at [`DOCUMENTATION.md`](./DOCUMENTATION.md) covering:

- System architecture with diagrams
- Database schema and ER diagram
- All pages and routes
- Feature specifications
- Authentication flows
- Security practices
- Deployment guide

---

## 📝 License

This project is private and proprietary.

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
