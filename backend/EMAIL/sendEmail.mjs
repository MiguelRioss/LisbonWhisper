import nodemailer from 'nodemailer';

let transporter;

function isEmailDeliveryDisabled() {
  const value = String(process.env.EMAIL_DELIVERY_DISABLED || '')
    .trim()
    .toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(value);
}

function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) throw new Error('Missing SMTP_HOST for email delivery');
  const { SMTP_USER, SMTP_PASS } = process.env;
  if (Boolean(SMTP_USER) !== Boolean(SMTP_PASS)) {
    throw new Error('Configure both SMTP_USER and SMTP_PASS for authenticated SMTP');
  }
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure =
    process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  return transporter;
}

async function sendEmail({
  to,
  cc,
  subject,
  html,
  attachments,
  replyTo,
  from,
}) {
  if (isEmailDeliveryDisabled()) {
    return {
      skipped: true,
      reason: 'EMAIL_DELIVERY_DISABLED',
    };
  }

  if (!to) {
    throw new Error('Missing "to"');
  }
  if (!html) {
    throw new Error('Missing "html"');
  }

  const mailer = getTransporter();
  const smtpFrom =
    from || process.env.EMAIL_FROM || 'Lisbon Whisper <info@lisbonwhisper.com>';

  return mailer.sendMail({
    from: smtpFrom,
    to,
    cc,
    subject,
    html,
    replyTo,
    attachments: Array.isArray(attachments) ? attachments : undefined,
  });
}

export { sendEmail };
