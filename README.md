# Willow & Clay

A paper-and-stamps styled online shop for handmade ceramics and candles. Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma and PostgreSQL.

## Features

**Shop**
- Home page with a polaroid-style hero and the latest pieces
- Category filter, search and sorting; product pages with glaze and size pickers
- Shopping bag kept in the browser; shipping is free over $100, otherwise $7
- Sold-out products are marked and cannot be added to the bag

**Accounts and orders**
- Email/password accounts (bcrypt, signed httpOnly session cookie)
- Checkout re-prices everything from the database and reduces stock in one transaction
- Order history for signed-in users

**Admin** (`/admin`, admins only)
- Add, edit and hide products (price, stock, glazes, sizes, photo link)
- See all orders, contact messages and set order status; cancelling an order returns its stock

**Info pages**
- About, Contact (messages are saved and shown in the admin), Careers (edit the openings list in `src/app/careers/page.tsx`) and Payment options

**Payments**
- Checkout offers "Pay on delivery" and, when `STORE_BANK_DETAILS` is set, "Bank transfer" (details are shown after ordering)
- The payment method is saved on each order and shown in the admin

**Not included:** online card payments (the page says "coming soon"). Stripe Checkout is the natural next step.

## Run locally

Requires Node 22+ and a PostgreSQL database.

```bash
cp .env.example .env          # set DATABASE_URL and a 32+ character SESSION_SECRET
npm install
npx prisma migrate dev        # create the tables
npm run db:seed               # sample categories and products
npm run dev                   # http://localhost:3000
```

## Settings
`STORE_EMAIL` is shown on the Contact and Careers pages. `STORE_BANK_DETAILS` lists your bank lines separated by `|`. See `.env.example`.

## Make yourself an admin

Register in the shop, then run:

```bash
npm run make-admin -- you@example.com
```

An "admin" link appears in the header.

## Checks

```bash
npx next typegen && npx tsc --noEmit && npm run lint && npm run build
```

The same checks run in GitHub Actions (`.github/workflows/ci.yml`).

## Going live

Set `DATABASE_URL` and a long random `SESSION_SECRET`, run `npx prisma migrate deploy`, then `npm run build && npm start`. Product photos are plain https links, so the images can be hosted anywhere.
