/**
 * CareerAI - Email Service
 * Handles sending verification emails via Nodemailer.
 */
const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

if (config.smtpUser && config.smtpPass) {
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

/**
 * Send an email.
 * If SMTP is not configured, logs the email in development instead of failing.
 */
const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log('⚠️  SMTP not configured. Email not sent.');
    console.log(`📧 To: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    if (html) console.log(`📧 HTML: ${html.slice(0, 500)}...`);
    return { skipped: true };
  }

  try {
    const info = await transporter.sendMail({
      from: config.smtpFrom,
      to,
      subject,
      text,
      html,
    });
    console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error;
  }
};

/**
 * Send a verification email with a token link.
 */
const sendVerificationEmail = async ({ to, name, token }) => {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;

  const html = `
    <div style="max-width:600px;margin:auto;padding:40px 24px;font-family:Arial,sans-serif;background:#0f172a;border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:32px;">
        <span style="font-size:28px;font-weight:bold;background:linear-gradient(90deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
          CareerAI
        </span>
      </div>
      <h1 style="font-size:24px;margin-bottom:16px;color:#fff;">Verify your email address</h1>
      <p style="line-height:1.6;color:#94a3b8;">
        Hi ${name},
      </p>
      <p style="line-height:1.6;color:#94a3b8;">
        Thanks for signing up for CareerAI! Please confirm your email address to activate your account.
        This link expires in 24 hours.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${verifyUrl}"
           style="display:inline-block;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;color:#fff;text-decoration:none;background:linear-gradient(90deg,#7c3aed,#2563eb);">
          Verify Email
        </a>
      </div>
      <p style="font-size:13px;color:#64748b;line-height:1.5;">
        If the button doesn't work, copy and paste this URL into your browser:<br/>
        <span style="color:#38bdf8;word-break:break-all;">${verifyUrl}</span>
      </p>
      <p style="font-size:13px;color:#64748b;margin-top:24px;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  const result = await sendMail({
    to,
    subject: 'Verify your CareerAI email',
    html,
  });

  return { ...result, verifyUrl };
};

module.exports = {
  sendMail,
  sendVerificationEmail,
};