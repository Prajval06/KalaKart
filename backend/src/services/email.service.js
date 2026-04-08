const nodemailer = require('nodemailer');
const config = require('../config/config');

let cachedTransporter = null;

const hasSmtpConfig = () => Boolean(config.smtpHost && config.smtpUser && config.smtpPass);

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;

  if (cachedTransporter) return cachedTransporter;

  const smtpPort = Number(config.smtpPort || 587);
  const secure = config.smtpSecure
    ? config.smtpSecure === 'true'
    : smtpPort === 465;

  cachedTransporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  return cachedTransporter;
};

const formatFromAddress = () => {
  if (config.smtpFrom) return config.smtpFrom;
  return `KalaKart <${config.smtpUser}>`;
};

const buildWelcomeEmail = (user, source = 'email') => {
  const title = source === 'google' ? 'Google account ready' : 'Account created';
  const signInMethod = source === 'google' ? 'Google' : 'email and password';

  return {
    subject: `Welcome to KalaKart, ${user.full_name}`,
    text: [
      `Hi ${user.full_name},`,
      '',
      `Your KalaKart account has been ${title.toLowerCase()}.`,
      `You can now sign in with ${signInMethod}.`,
      '',
      'If this was not you, please contact support immediately.',
      '',
      'Thanks,',
      'The KalaKart Team',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3a2a20">
        <h2 style="margin:0 0 12px">Welcome to KalaKart</h2>
        <p>Hi ${user.full_name},</p>
        <p>Your KalaKart account has been <strong>${title.toLowerCase()}</strong>.</p>
        <p>You can now sign in with <strong>${signInMethod}</strong>.</p>
        <p>If this was not you, please contact support immediately.</p>
        <p>Thanks,<br>The KalaKart Team</p>
      </div>
    `,
  };
};

const buildResetPasswordEmail = (user, resetUrl) => {
  return {
    subject: `Reset your KalaKart password`,
    text: [
      `Hi ${user.full_name},`,
      '',
      'We received a request to reset your KalaKart password.',
      `Reset it here: ${resetUrl}`,
      '',
      'If you did not request this, you can ignore this email.',
      '',
      'Thanks,',
      'The KalaKart Team',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#3a2a20">
        <h2 style="margin:0 0 12px">Reset your KalaKart password</h2>
        <p>Hi ${user.full_name},</p>
        <p>We received a request to reset your KalaKart password.</p>
        <p><a href="${resetUrl}" style="color:#8B2500;font-weight:bold">Reset your password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>Thanks,<br>The KalaKart Team</p>
      </div>
    `,
  };
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    return { skipped: true, reason: 'smtp_not_configured' };
  }

  return transporter.sendMail({
    from: formatFromAddress(),
    to,
    subject,
    text,
    html,
  });
};

const sendWelcomeEmail = async (user, source = 'email') => {
  if (!user?.email) return { skipped: true, reason: 'missing_recipient' };

  const message = buildWelcomeEmail(user, source);
  return sendEmail({
    to: user.email,
    ...message,
  });
};

const sendResetPasswordEmail = async (user, resetUrl) => {
  if (!user?.email) return { skipped: true, reason: 'missing_recipient' };

  const message = buildResetPasswordEmail(user, resetUrl);
  return sendEmail({
    to: user.email,
    ...message,
  });
};

module.exports = {
  buildWelcomeEmail,
  buildResetPasswordEmail,
  sendEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
};
