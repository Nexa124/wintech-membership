# WINTECH Membership Platform

A complete membership platform with Paystack payment integration, member registration, email notifications, and admin dashboard.

## 🚀 Features

- **Paystack Payment Integration** — Secure payment processing for membership registration
- **Member Registration** — Collect member details and track registrations
- **Email Notifications** — Automated confirmation emails upon successful payment
- **Admin Dashboard** — View all members, search, filter, and export data
- **Real-time Stats** — Track revenue, member counts, and plan breakdowns
- **Responsive Design** — Mobile-friendly landing page and admin panel
- **WhatsApp Integration** (optional) — Send payment confirmations via WhatsApp

## 📋 Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/Nexa124/wintech-membership.git
cd wintech-membership
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update with your credentials:

```env
# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key

# Email (Gmail)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@wintech.com

# Admin Protection
ADMIN_SECRET_KEY=your_secure_random_key

# Port (optional)
PORT=5000
```

### 3. Get Paystack Keys

1. Go to [paystack.com](https://paystack.com)
2. Sign up / Log in
3. Navigate to **Settings > API Keys**
4. Copy your public key (starts with `pk_test_` or `pk_live_`)
5. Copy your secret key (starts with `sk_test_` or `sk_live_`)
6. Add both to your `.env` file

### 4. Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create an app password for "Mail"
4. Add to `.env` as `SMTP_PASS`

### 5. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## 📍 URLs

- **Landing Page**: `http://localhost:5000/`
- **Admin Dashboard**: `http://localhost:5000/admin`
- **Health Check**: `http://localhost:5000/api/health`

## 🔐 Admin Dashboard Access

1. Open `/admin`
2. Enter your `ADMIN_SECRET_KEY` from `.env`
3. View all members, stats, and export data

## 🔌 API Endpoints

### Public Endpoints

- `POST /api/paystack/initialize` — Initialize Paystack payment
- `POST /api/paystack/verify` — Verify payment and register member

### Admin Endpoints

- `GET /api/admin/members?key=YOUR_KEY` — Get all members
- `GET /api/admin/stats?key=YOUR_KEY` — Get dashboard stats
- `GET /api/admin/members/search?key=YOUR_KEY&q=query` — Search members
- `GET /api/admin/members/export?key=YOUR_KEY` — Export as CSV

## 📤 Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy
```

### Heroku

```bash
heroku create your-app-name
heroku config:set PAYSTACK_PUBLIC_KEY=pk_...
heroku config:set PAYSTACK_SECRET_KEY=sk_...
heroku config:set SMTP_USER=...
heroku config:set SMTP_PASS=...
heroku config:set ADMIN_SECRET_KEY=...
git push heroku main
```

### Railway / Render

Use the dashboard to add environment variables, then deploy from GitHub.

## 📧 Email Setup

We use Gmail with app passwords for email notifications. Alternative providers:

- SendGrid
- Mailgun
- AWS SES
- Resend

Modify `server.js` to use a different email service.

## 💾 Data Storage

Currently uses in-memory storage (resets on server restart). For production:

- **PostgreSQL** — use `pg` npm package
- **MongoDB** — use `mongoose` npm package
- **Supabase** — use `@supabase/supabase-js`
- **Firebase** — use `firebase-admin`
- **Google Sheets** — use `google-auth-library-nodejs`

## 🧪 Test Paystack Payment

Paystack test card: `4111 1111 1111 1111`
Expiry: Any future date
CVV: Any 3 digits

## 📱 WhatsApp Integration

To enable WhatsApp notifications:

1. Set up WhatsApp Business API
2. Add `WHATSAPP_API_KEY` and `WHATSAPP_PHONE_ID` to `.env`
3. Uncomment WhatsApp code in `server.js`

## 🆘 Troubleshooting

**"Cannot find module 'express'"**
```bash
npm install
```

**"Invalid Paystack key"**
- Check your `.env` file
- Verify keys from Paystack dashboard
- Use test keys for development

**"Email not sending"**
- Enable "Less secure apps" in Gmail (deprecated)
- Use Gmail app password instead
- Check SMTP credentials in `.env`

**"Admin dashboard not loading"**
- Verify `ADMIN_SECRET_KEY` matches in `.env`
- Check browser console for errors
- Ensure server is running

## 📄 Files

- `index.html` — Landing page (in public/)
- `styles.css` — Landing page styles (in public/)
- `script.js` — Landing page Paystack integration (in public/)
- `public/admin.html` — Admin dashboard
- `server.js` — Express backend server
- `package.json` — Dependencies
- `.env.example` — Environment template

## 📞 Support

For issues or questions:
1. Check the README thoroughly
2. Review Paystack API docs: https://paystack.com/docs
3. Check server logs for errors
4. Verify all environment variables are set

## 📜 License

MIT

---

**Built with ❤️ for WINTECH**
