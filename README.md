# Willow & Clay

A paper-and-stamps styled online shop for handmade ceramics and candles. Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma and PostgreSQL.

## Features

**Shop**
- Home page with a polaroid-style hero and the latest pieces
- Category filter, search and sorting; product pages with glaze and size pickers
- Shopping bag kept in the browser; prices are in Indian rupees; shipping is free over ₹1,499, otherwise ₹79
- Sold-out products are marked and cannot be added to the bag

**Customer features**
- Wishlist (save pieces from the product page, see them at `/wishlist`)
- Reviews and star ratings; only customers who ordered a piece can review it
- Discount codes at checkout (percent or rupees off, minimum order, usage limit, expiry)
- Saved addresses that fill checkout, and a PIN code delivery check on product pages and at checkout
- Forgot password by email link (valid 1 hour, single use)
- Order tracking (courier and tracking number) and printable invoices at `/orders/ID/invoice`

**Accounts and orders**
- Email/password accounts (bcrypt, signed httpOnly session cookie)
- Checkout re-prices everything from the database and reduces stock in one transaction
- Order history for signed-in users

**Admin** (`/admin`, admins only)
- Add, edit and hide products (price, stock, glazes, sizes, photo link)
- Dashboard: revenue today / 7 / 30 days, a 14 day chart, best sellers, low stock
- Orders: set status, add courier and tracking number (emails the customer), refund paid online orders through Razorpay; cancelling an order returns its stock and coupon use
- Create and switch off coupons; moderate reviews; read contact messages

**Info pages**
- About, Contact (messages are saved and shown in the admin), Careers (edit the openings list in `src/app/careers/page.tsx`) and Payment options

**Payments**
- **Online payment with Razorpay** (UPI, cards, net banking, wallets, EMI) when the Razorpay keys are set. The server creates the order and amount, the customer pays in Razorpay's window, and the server verifies the payment signature before marking the order paid. A webhook (`/api/razorpay/webhook`) also marks orders paid if the customer closes the tab after paying.
- "Pay on delivery" always, and "Bank transfer" when `STORE_BANK_DETAILS` is set (details are shown after ordering)
- Unpaid online orders are cancelled and their stock returned if the payment window is closed
- The payment method is saved on each order and shown in the admin

**Not included:** partial refunds, GST invoices and tax calculation, SMS notifications.

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

## Turn on online payment
1. Create a Razorpay account and copy the **test** keys from Dashboard > Account & Settings > API Keys.
2. Put them in `.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`, then restart. A "UPI, cards, net banking, wallets, EMI" option appears at checkout.
3. Add a webhook in the Razorpay dashboard pointing to `https://YOUR-SITE/api/razorpay/webhook` with events `payment.captured` and `order.paid`, and set its secret as `RAZORPAY_WEBHOOK_SECRET`.
4. Test with Razorpay's test cards and `success@razorpay` as the test UPI id, then switch to live keys after your account is activated.

Which methods appear (UPI, EMI, Pay Later, wallets) is controlled in the Razorpay dashboard.

## Email
Order confirmation, shipped and password reset emails are sent with SMTP. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` and `SITE_URL` in `.env` (Gmail, Brevo, Resend and others all offer SMTP). Without `SMTP_HOST`, emails are printed in the server log instead, so you can still copy a password reset link while developing.

## Delivery check
`STORE_PIN` is where parcels leave from (used for the delivery estimate). Set `SERVICEABLE_PIN_PREFIXES` (for example `22,11,40`) to deliver only to PIN codes starting with those digits.

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
