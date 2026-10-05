# WINTECH Membership Platform

A complete membership platform with Paystack payment integration, member registration, email notifications, and admin dashboard.

## 🚀 Features

- Paystack-ready payment flow
- Member registration form
- Admin dashboard
- Demo mode enabled by default
- Responsive landing page

## Run locally

```bash
npm install
npm start
```

Open:
- `http://localhost:5000/` for the landing page
- `http://localhost:5000/admin` for the admin dashboard

Admin key in demo mode:

```text
demo-admin-key
```

## Payment setup

Replace the placeholder Paystack key in `script.js` to go live:

```js
const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

For real production, also add your Paystack secret key in `.env` and define `ADMIN_SECRET_KEY`.

## Demo mode

This project is currently set to demo mode so it works immediately without a live Paystack account or SMTP credentials.

## Live configuration

Use `.env.example` as a template and add your real values:

```bash
cp .env.example .env
```

Then add:
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`
- `SMTP_USER`
- `SMTP_PASS`
- `ADMIN_SECRET_KEY`

## Notes

- In demo mode, the registration flow shows a success message instead of opening a live Paystack checkout.
- The backend keeps a temporary in-memory member list for testing.
- For production, replace the in-memory storage with Supabase, Firebase, or a database.

## Files

- `index.html` — landing page
- `styles.css` — styling
- `script.js` — client-side checkout logic
- `server.js` — demo backend
- `public/admin.html` — admin dashboard

---

Built for WINTECH.
