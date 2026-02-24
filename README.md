# SWATHOOPS — Premium Men's Footwear

Full-stack e-commerce application built with **Next.js 16**, **Prisma**, **PostgreSQL**, and **Razorpay** payments.

## Architecture

This is a **monolithic Next.js application** (frontend + API routes in one codebase). This is intentional:

- **Next.js API routes** serve as the backend — no separate server needed
- **Server-side rendering** and **API co-location** reduce latency
- **Single deployment unit** simplifies ops for a small-to-medium e-commerce store
- When you outgrow this, the API routes can be extracted into a standalone service

> **When to split:** If you need independent scaling of API vs frontend (e.g. the API serves multiple clients, or you need >10k RPM on the API alone), extract `src/app/api/` into a standalone Express/Fastify server.

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database URL, JWT secret, and Razorpay keys

# 3. Run migrations and seed
npm run db:migrate
npm run db:seed

# 4. Start development server
npm run dev
```

## Environment Variables

All configuration lives in `.env` — see [.env.example](.env.example) for the full list.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Strong random secret (32+ chars) |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Client-side Razorpay key |
| `ADMIN_EMAIL` | No | Seed admin email (default: admin@swathoops.com) |
| `ADMIN_PASSWORD` | No | Seed admin password |

## Project Structure

```
src/
├── app/                    # Next.js App Router — pages & API routes
│   ├── api/                # Backend API endpoints
│   │   ├── admin/          # Admin-only endpoints (auth-protected)
│   │   ├── orders/         # Order management
│   │   ├── products/       # Product CRUD
│   │   ├── razorpay/       # Payment processing
│   │   ├── checkout/       # Checkout settings
│   │   └── upload/         # File uploads
│   ├── admin/              # Admin dashboard pages
│   ├── shop/               # Storefront pages
│   ├── checkout/           # Checkout flow
│   └── ...
├── components/             # Reusable React components
├── config/                 # Centralized configuration
│   ├── index.ts            # Server-side config (env vars)
│   └── client.ts           # Client-side config (NEXT_PUBLIC_ vars)
├── context/                # React Context providers (Cart, Toast)
├── lib/                    # Server utilities (auth, db, razorpay)
└── types/                  # TypeScript type definitions
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:seed` | Seed database |
| `npm run db:reset` | Reset database |
| `npm run db:studio` | Open Prisma Studio |

## Production Deployment

### Docker (Recommended)

```bash
# Set required env vars
export JWT_SECRET="your-production-secret"
export RAZORPAY_KEY_ID="rzp_live_xxx"
export RAZORPAY_KEY_SECRET="your-secret"
export NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxx"
export DB_PASSWORD="strong-db-password"

# Build and start
docker compose up -d

# Run migrations (first time)
docker compose exec app npx prisma migrate deploy

# Seed (first time)
docker compose exec app npx tsx prisma/seed.ts
```

### VPS / Cloud VM

```bash
npm ci --production
npx prisma migrate deploy
npm run build
npm start
```

### Vercel / Railway

Connect your Git repo and set environment variables in the dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcrypt (admin cookie-based)
- **Payments:** Razorpay + Cash on Delivery
- **Styling:** Tailwind CSS 4 + Framer Motion
- **Deployment:** Docker / Standalone Node.js
