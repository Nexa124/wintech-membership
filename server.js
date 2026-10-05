const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory database (replace with Supabase, Firebase, or PostgreSQL in production)
const members = [];

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'your-admin-key';

const PLAN_PRICES = {
  Starter: 3000,
  Plus: 5000,
  Pro: 7000,
  Premium: 11000,
};

// Email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper: Send email
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

// Helper: Send WhatsApp message (optional)
async function sendWhatsAppMessage(phone, message) {
  if (!process.env.WHATSAPP_API_KEY) return;

  try {
    await axios.post(
      `https://graph.instagram.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
        },
      }
    );
    console.log(`WhatsApp message sent to ${phone}`);
  } catch (error) {
    console.error('WhatsApp send error:', error.message);
  }
}

// Route: Initialize Paystack payment
app.post('/api/paystack/initialize', async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;

    if (!email || !amount || !metadata) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to kobo
        currency: 'NGN',
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Route: Verify Paystack payment and save member
app.post('/api/paystack/verify', async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === 'success') {
      const memberData = {
        id: Date.now(),
        fullName: data.metadata.custom_fields.find((f) => f.variable_name === 'full_name')?.value,
        email: data.customer.email,
        phone: data.metadata.custom_fields.find((f) => f.variable_name === 'phone')?.value || 'N/A',
        plan: data.metadata.custom_fields.find((f) => f.variable_name === 'membership_plan')?.value,
        amount: data.amount / 100,
        reference: data.reference,
        status: 'completed',
        date: new Date().toISOString(),
        message: data.metadata.custom_fields.find((f) => f.variable_name === 'message')?.value || '',
      };

      members.push(memberData);

      // Send confirmation email
      const emailHtml = `
        <h2>Welcome to WINTECH!</h2>
        <p>Hi ${memberData.fullName},</p>
        <p>Your payment of ₦${memberData.amount.toLocaleString()} has been received successfully.</p>
        <p><strong>Membership Plan:</strong> ${memberData.plan}</p>
        <p><strong>Reference:</strong> ${memberData.reference}</p>
        <p>You now have access to all benefits of your ${memberData.plan} membership plan.</p>
        <p>Thank you for joining WINTECH!</p>
        <hr>
        <p>If you have any questions, reply to this email or contact our support team.</p>
      `;
      await sendEmail(memberData.email, 'Welcome to WINTECH - Payment Confirmed', emailHtml);

      // Send WhatsApp message (optional)
      const whatsappMessage = `Hi ${memberData.fullName}, your WINTECH ${memberData.plan} membership payment has been confirmed. Reference: ${memberData.reference}`;
      await sendWhatsAppMessage(memberData.phone, whatsappMessage);

      res.json({
        success: true,
        message: 'Payment verified and member registered',
        member: memberData,
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Route: Get all members (admin only)
app.get('/api/admin/members', (req, res) => {
  const { key } = req.query;

  if (key !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    total: members.length,
    members: members.sort((a, b) => new Date(b.date) - new Date(a.date)),
  });
});

// Route: Get member stats (admin only)
app.get('/api/admin/stats', (req, res) => {
  const { key } = req.query;

  if (key !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const stats = {
    totalMembers: members.length,
    totalRevenue: members.reduce((sum, m) => sum + m.amount, 0),
    planBreakdown: {},
    recentRegistrations: members.slice(0, 10),
  };

  Object.keys(PLAN_PRICES).forEach((plan) => {
    const planMembers = members.filter((m) => m.plan === plan);
    stats.planBreakdown[plan] = {
      count: planMembers.length,
      revenue: planMembers.reduce((sum, m) => sum + m.amount, 0),
    };
  });

  res.json(stats);
});

// Route: Search members (admin only)
app.get('/api/admin/members/search', (req, res) => {
  const { key, q } = req.query;

  if (key !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const query = q.toLowerCase();
  const results = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.phone.includes(query) ||
      m.reference.includes(query)
  );

  res.json({ results });
});

// Route: Export members to CSV (admin only)
app.get('/api/admin/members/export', (req, res) => {
  const { key } = req.query;

  if (key !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const csv =
    'ID,Full Name,Email,Phone,Plan,Amount,Reference,Status,Date,Message\n' +
    members
      .map(
        (m) =>
          `${m.id},"${m.fullName}",${m.email},${m.phone},${m.plan},${m.amount},${m.reference},${m.status},"${m.date}","${m.message}"`
      )
      .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=wintech_members.csv');
  res.send(csv);
});

// Route: Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WINTECH Server running on port ${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
});

module.exports = app;
