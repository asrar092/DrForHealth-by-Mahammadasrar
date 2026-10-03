const nodemailer = require('nodemailer');

/**
 * Modular transporter: SMTP in development, AWS SES in production.
 * Swapping providers later (Resend/SendGrid/Mailgun) only requires
 * changing this file — business logic in emailService.js stays the same.
 */
function buildTransport() {
  if (process.env.EMAIL_PROVIDER === 'ses') {
    const aws = require('aws-sdk');
    aws.config.update({ region: process.env.AWS_REGION });
    return nodemailer.createTransport({ SES: new aws.SES({ apiVersion: '2010-12-01' }) });
  }

  // Default: SMTP (Mailtrap/Gmail/etc.) for local development
  return nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  family: 6,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
}

const transporter = buildTransport();

module.exports = transporter;
