# GreenLens Backend

AI-powered environmental impact assistant – Next.js API backend with TypeScript, Prisma, PostgreSQL, and NextAuth.js.

## Stack

- **Next.js 14** (App Router), **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **NextAuth.js** (credentials provider, JWT)
- **Zod** (validation), **bcryptjs** (passwords), **Winston** (logging)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` (PostgreSQL)
   - Set `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`)
   - Set `NEXTAUTH_URL` (e.g. `http://localhost:3000`)

3. **Database**
   ```bash
   npm run db:push      # or db:migrate for migrations
   npm run db:seed      # challenges & badges
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (email, password, name) |
| *NextAuth* | `/api/auth/*` | Login, session, callback |
| POST | `/api/products/lookup` | Get product by barcode (cache + Open Food Facts) |
| GET | `/api/products/[barcode]` | Get product by barcode |
| POST | `/api/scans` | Record scan (auth) |
| GET | `/api/scans` | User scan history (paginated) |
| GET | `/api/scans/history` | Scan history with filters |
| GET | `/api/challenges` | All challenges |
| GET | `/api/challenges/user` | User challenges + progress (auth) |
| POST | `/api/challenges/user` | Accept challenge (auth) |
| PUT | `/api/challenges/[id]` | Update challenge progress (auth) |
| GET | `/api/badges` | All badges |
| GET | `/api/badges/user` | User badges + earned (auth) |
| GET | `/api/user/profile` | Profile (auth) |
| PUT | `/api/user/profile` | Update profile (auth) |
| GET | `/api/user/stats` | User stats (auth) |
| DELETE | `/api/user` | Delete account (auth) |

## Error format

```json
{ "error": "Message", "code": "ERROR_CODE" }
```

Codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `EXTERNAL_API_ERROR`, `CONFLICT`, `INTERNAL`.

## Seed data

- **Challenges**: Getting Started (5 scans), Plastic Detective, Eco Shopper, Scan Master, Week Warrior
- **Badges**: First Scan, 10/50 Scans, Eco Novice/Expert, 7-Day Streak

## Deployment

- Use **Vercel Postgres** or **Render** for PostgreSQL
- Set env vars in the host
- Run migrations on deploy
- Optional: Sentry, Redis for rate limiting
