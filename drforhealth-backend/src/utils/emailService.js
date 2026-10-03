const transporter = require('../config/email');

const BRAND = {
  name: 'Dr For Health',
  green: '#2ECC71',
  blue: '#0077B6',
  charcoal: '#2D2D2D',
};

function wrapTemplate(bodyHtml) {
  return `
  <div style="font-family: Arial, sans-serif; background:#F8FAFC; padding:32px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <div style="background:linear-gradient(135deg, ${BRAND.green}, ${BRAND.blue});padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">${BRAND.name}</h1>
      </div>
      <div style="padding:32px;color:${BRAND.charcoal};line-height:1.6;">
        ${bodyHtml}
      </div>
      <div style="padding:16px;text-align:center;font-size:12px;color:#999;">
        © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
      </div>
    </div>
  </div>`;
}

async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

const emailService = {
  sendWelcome: (to, name) =>
    sendEmail({
      to,
      subject: `Welcome to ${BRAND.name}!`,
      html: wrapTemplate(`<p>Hi ${name},</p><p>Welcome aboard! We're excited to help you on your health journey.</p>`),
    }),

  sendVerification: (to, name, verifyUrl) =>
    sendEmail({
      to,
      subject: 'Verify your email',
      html: wrapTemplate(
        `<p>Hi ${name},</p><p>Please verify your email to activate your account:</p>
         <p><a href="${verifyUrl}" style="background:${BRAND.green};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify Email</a></p>`
      ),
    }),

  sendPasswordReset: (to, name, resetUrl) =>
    sendEmail({
      to,
      subject: 'Reset your password',
      html: wrapTemplate(
        `<p>Hi ${name},</p><p>Click below to reset your password. This link expires in 1 hour.</p>
         <p><a href="${resetUrl}" style="background:${BRAND.blue};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a></p>`
      ),
    }),

  sendOrderConfirmation: (to, name, ebookTitle, amount) =>
    sendEmail({
      to,
      subject: `Order Confirmed: ${ebookTitle}`,
      html: wrapTemplate(
        `<p>Hi ${name},</p><p>Your order for <strong>${ebookTitle}</strong> (₹${amount}) is confirmed. You can access it anytime from your dashboard.</p>`
      ),
    }),

  sendPurchaseSuccess: (to, name, ebookTitle, dashboardUrl) =>
    sendEmail({
      to,
      subject: `Your eBook is ready: ${ebookTitle}`,
      html: wrapTemplate(
        `<p>Hi ${name},</p><p><strong>${ebookTitle}</strong> is now available in your library.</p>
         <p><a href="${dashboardUrl}" style="background:${BRAND.green};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Go to My Library</a></p>`
      ),
    }),

  sendPaymentFailed: (to, name, ebookTitle) =>
    sendEmail({
      to,
      subject: 'Payment Failed',
      html: wrapTemplate(`<p>Hi ${name},</p><p>Your payment for <strong>${ebookTitle}</strong> did not go through. Please try again.</p>`),
    }),

  sendNewDeviceLogin: (to, name, deviceInfo) =>
    sendEmail({
      to,
      subject: 'New login to your account',
      html: wrapTemplate(`<p>Hi ${name},</p><p>We noticed a new login: ${deviceInfo}. If this wasn't you, please reset your password immediately.</p>`),
    }),
};

module.exports = emailService;
