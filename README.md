# WINTECH Membership Platform

A static landing page for WINTECH with a membership pricing section, registration form, and secure Paystack payment integration.

## Setup

1. Open the project in a browser.
2. Replace the placeholder public key in `script.js` with your live Paystack public key.
3. Launch the page and complete a test payment using Paystack's test card.

## Paystack key

Update this line in `script.js`:

```js
const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

Use your real Paystack public key from the Paystack dashboard.

## Files

- `index.html` — page structure
- `styles.css` — website styles and responsive layout
- `script.js` — Paystack checkout logic and plan selection logic

## Notes

- This is a front-end implementation using Paystack Inline Checkout.
- For production use, you should also store the transaction reference and member details in a backend or database.
- The page is currently static HTML/CSS/JS and can be hosted on GitHub Pages, Netlify, or Vercel.
