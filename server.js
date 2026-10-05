const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const rootDir = __dirname;
app.use(express.static(rootDir));
app.use('/public', express.static(path.join(rootDir, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

const registrations = [];
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'demo-admin-key';

const PLAN_PRICES = {
  Starter: 3000,
  Plus: 5000,
  Pro: 7000,
  Premium: 11000,
};

const BANK_DETAILS = {
  accountName: 'Chisom Anderson Ezurike',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
  bankName: process.env.BANK_NAME || 'Your Bank Name',
  bankCode: process.env.BANK_CODE || '000',
};

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'demo@gmail.com',
    pass: process.env.SMTP_PASS || 'demo-app-password',
  },
});

async function sendEmail(to, subject, htmlContent) {
  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@wintech.com',
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error);
  }
}

app.post('/api/register', (req, res) => {
  try {
    const { fullName, email, phone, plan, amount, message, registrationDate } = req.body;

    if (!fullName || !email || !phone || !plan || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const registration = {
      id: Date.now(),
      fullName,
      email,
      phone,
      plan,
      amount,
      message,
      registrationDate,
      paymentStatus: 'pending',
      paymentMethod: 'bank_transfer',
    };

    registrations.push(registration);

    res.json({
      success: true,
      message: 'Registration received. Please proceed with bank transfer.',
      registration,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/send-registration-email', async (req, res) => {
  try {
    const { email, fullName, plan, amount, bankDetails } = req.body;

    const emailHtml = `
      <h2>Welcome to WINTECH!</h2>
      <p>Hi ${fullName},</p>
      <p>Your ${plan} membership registration has been received. To activate your membership, please make a bank transfer of <strong>₦${amount.toLocaleString()}</strong> to the account below:</p>

      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #35e0a1; margin: 20px 0;">
        <p><strong>Account Name:</strong> ${bankDetails.accountName}</p>
        <p><strong>Account Number:</strong> ${bankDetails.accountNumber}</p>
        <p><strong>Bank Name:</strong> ${bankDetails.bankName}</p>
        <p><strong>Bank Code:</strong> ${bankDetails.bankCode}</p>
        <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
      </div>

      <p>Once we receive your payment, you will have immediate access to all benefits of your ${plan} membership plan.</p>
      <p>Thank you for joining WINTECH!</p>
    `;

    await sendEmail(email, 'WINTECH Membership Registration - Bank Transfer Details', emailHtml);

    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/api/admin/registrations', (req, res) => {
  const { key } = req.query;

  if (key !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    total: registrations.length,
    registrations: registrations.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)),
  });
});

app.get('/api/admin/stats', (req, res) => {
  const { key } = req.query;

  if (key !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const stats = {
    totalRegistrations: registrations.length,
    totalValue: registrations.reduce((sum, r) => sum + r.amount, 0),
    pendingPayments: registrations.filter((r) => r.paymentStatus === 'pending').length,
    completedPayments: registrations.filter((r) => r.paymentStatus === 'completed').length,
    planBreakdown: {},
  };

  Object.keys(PLAN_PRICES).forEach((plan) => {
    const planRegs = registrations.filter((r) => r.plan === plan);
    stats.planBreakdown[plan] = {
      count: planRegs.length,
      value: planRegs.reduce((sum, r) => sum + r.amount, 0),
    };
  });

  res.json(stats);
});

app.get('/api/admin/registrations/search', (req, res) => {
  const { key, q } = req.query;

  if (key !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const query = q.toLowerCase();
  const results = registrations.filter(
    (r) =>
      r.fullName.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.phone.includes(query)
  );

  res.json({ results });
});

app.get('/api/admin/registrations/export', (req, res) => {
  const { key } = req.query;

  if (key !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const csv =
    'ID,Full Name,Email,Phone,Plan,Amount,Payment Status,Registration Date,Message\n' +
    registrations
      .map(
        (r) =>
          `${r.id},"${r.fullName}",${r.email},${r.phone},${r.plan},${r.amount},${r.paymentStatus},"${r.registrationDate}","${r.message}"`
      )
      .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=wintech_registrations.csv');
  res.send(csv);
});

app.get('/api/bank-details', (req, res) => {
  res.json(BANK_DETAILS);
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'admin.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WINTECH server running on port ${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`Bank transfer account: ${BANK_DETAILS.accountNumber} (${BANK_DETAILS.bankName})`);
});

module.exports = app;
