const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  return transporter;
};

const verifyTransporter = async () => {
  try {
    const t = getTransporter();
    await t.verify();
    console.log('[EMAIL] SMTP transporter verified and ready');
    return true;
  } catch (error) {
    console.warn(`[EMAIL] SMTP verification failed: ${error.message}. Emails will be logged to console.`);
    return false;
  }
};

module.exports = { getTransporter, verifyTransporter };
