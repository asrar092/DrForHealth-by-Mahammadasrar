# Dr For Health — Frontend

React + Vite + Tailwind frontend for the Dr For Health eBook platform. Built to
work directly against the backend from the previous step.

## What's included in this build

- **Design system**: Tailwind config using your exact logo palette (green/blue
  gradients, charcoal, light + glassmorphism), Plus Jakarta Sans + Inter typography.
- **Auth**: login, register (with Google OAuth button wired to the backend's
  `/api/auth/google` redirect flow), silent token refresh via an axios
  interceptor, protected routes.
- **Catalog**: Home page with hero + featured books, Store page with search
  and category filtering.
- **eBook detail + checkout**: full Razorpay Checkout integration — creates an
  order, opens the payment modal, verifies the signature client-side, then
  redirects to the library (actual access is granted by the backend webhook).
- **Dashboard**: Overview (stats), My Library (protected downloads via
  signed URLs), Order History.

## Not yet included (next steps)

- Download History, Wishlist, Profile/Security Settings pages (routes exist
  in the backend, not yet wired up here)
- Admin panel (separate app section — next build step)
- Blog, About, Contact, FAQ, legal pages, Testimonials
- Forgot/reset password pages (backend routes exist, no UI yet)
- Image serving: `coverImageKey` currently points at `/api/assets/...`, which
  is a placeholder — you'll want to either serve these via a CloudFront URL
  once S3 is configured, or add a small `/api/assets/:key` proxy route in the
  backend. Until then cover images will silently hide (handled gracefully).

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` to `http://localhost:5000`
(the backend from the previous build step) — see `vite.config.js`.

## Testing the purchase flow

1. Start the backend (`npm run dev` in the backend folder) with Razorpay test
   keys in `.env`
2. Register + verify email, log in here
3. Browse to an eBook (you'll need at least one created via the backend's
   admin eBook routes — see backend README)
4. Click **Buy Now** → Razorpay test checkout opens → use Razorpay's test
   card numbers → on success you're redirected to My Library
5. Click **Download** — this calls the protected endpoint and opens a
   signed, 5-minute S3 URL

## Build

```bash
npm run build
```

Builds cleanly with zero errors (verified: 1,561 modules transformed).
