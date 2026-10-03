# Dr For Health — Backend API

Node.js + Express + MongoDB backend for the Dr For Health eBook platform.

## What's included in this build

- **Auth**: register, email verification, login, JWT access + refresh tokens (httpOnly cookies),
  Google OAuth, forgot/reset password, account lockout after failed attempts, logout / logout-all-devices.
- **eBooks**: public catalog with search/filter/pagination, admin CRUD with S3-backed
  PDF + cover image uploads.
- **Categories**: admin-manageable.
- **Orders & Payments**: Razorpay order creation, client-side signature verification,
  and a **webhook** endpoint (the authoritative source of truth) that grants access
  only after a verified `payment.captured` event.
- **Purchases**: protected library, **signed short-lived S3 download URLs** — the
  full PDF is never publicly accessible, and a `Purchase` record is required before
  any signed URL is issued.
- **Security**: helmet, CORS, rate limiting (tighter on auth routes), bcrypt hashing,
  input validation, centralized error handling.

## Not yet included (next steps)

- Coupon admin routes/controller (model exists, order flow already applies coupons —
  admin CRUD endpoints for coupons come next)
- Review, Notification, Blog, Newsletter, Contact, AdminLog modules
- Redis-backed caching of catalog responses
- Automated tests

## Setup

```bash
cp .env.example .env
# fill in MONGO_URI, JWT secrets, Razorpay keys, AWS keys, SMTP creds

npm install
npm run dev
```

Requires a running MongoDB instance. Redis is optional in dev — the server logs a
warning and continues without it if unavailable.

## Testing the core flow locally

1. `POST /api/auth/register` → check your SMTP inbox (e.g. Mailtrap) for the verification email
2. `GET /api/auth/verify-email?token=...&email=...` (link from the email)
3. `POST /api/auth/login` → returns `accessToken`, sets cookies
4. Create a category directly in MongoDB (admin category routes need a super_admin user —
   set a user's `role` to `super_admin` manually in the DB for now, or via `npm run seed` once
   you add a seed script)
5. `POST /api/ebooks/admin` (multipart form: `coverImage`, `pdfFile`, `title`, `description`,
   `category`, `priceINR`) — creates an eBook
6. `POST /api/orders` with `{ ebookId }` → returns a Razorpay order to open in Razorpay Checkout
7. Complete payment in Razorpay's test mode → webhook fires → `Purchase` record created
8. `GET /api/purchases/:ebookId/download` → returns a signed S3 URL valid for 5 minutes

For local webhook testing, use the Razorpay CLI or a tool like `ngrok` to expose your
local server and register that URL in the Razorpay Dashboard webhook settings.

## Key security notes

- The PDF S3 bucket objects are **private**. Downloads only ever happen via
  `getSignedDownloadUrl()`, which requires an existing `Purchase` row.
- Access is granted by the **webhook**, not the client-side verify call — a user
  closing their browser mid-payment can't spoof ownership.
- Refresh tokens are stored hashed and rotated on every use; `logout-all` clears
  all of them for a user.
