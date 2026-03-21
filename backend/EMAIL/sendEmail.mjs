import nodemailer from 'nodemailer';
import { sendViaMailchimpMarketing } from './mailchimpMarketing.mjs';

const MAILCHIMP_TXN_ENDPOINT =
  'https://mandrillapp.com/api/1.0/messages/send.json';

let transporter;

function normalizeProvider(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function parseFrom(value, fallbackEmail) {
  const raw = String(value || '').trim();
  if (!raw) {
    return { email: fallbackEmail || '', name: '' };
  }
  const match = raw.match(/^\s*([^<]+?)\s*<\s*([^>]+)\s*>\s*$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: raw, name: '' };
}

function normalizeRecipients(to) {
  if (!to) return [];
  if (Array.isArray(to)) {
    return to
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  }
  return String(to)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function mergeUniqueRecipients(...values) {
  const seen = new Set();
  const emails = [];

  values.forEach((value) => {
    normalizeRecipients(value).forEach((email) => {
      const key = email.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      emails.push(email);
    });
  });

  return emails;
}

function isEmailDeliveryDisabled() {
  const value = String(process.env.EMAIL_DELIVERY_DISABLED || '')
    .trim()
    .toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(value);
}

function hasMailchimpTransactionalConfig() {
  return Boolean(
    process.env.MAILCHIMP_TXN_API_KEY ||
      process.env.MAILCHIMP_TRANSACTIONAL_API_KEY ||
      process.env.MANDRILL_API_KEY
  );
}

function mapAttachments(attachments) {
  if (!Array.isArray(attachments)) return undefined;
  return attachments
    .map((attachment) => {
      if (!attachment) return null;
      const name = attachment.filename || attachment.name || 'attachment';
      const type =
        attachment.contentType ||
        attachment.content_type ||
        attachment.type ||
        'application/octet-stream';
      const content = attachment.content;
      if (!content) return null;
      const encoded = Buffer.isBuffer(content)
        ? content.toString('base64')
        : Buffer.from(String(content)).toString('base64');
      return { type, name, content: encoded };
    })
    .filter(Boolean);
}

function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure =
    process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendViaMailchimpTransactional({
  to,
  cc,
  subject,
  html,
  attachments,
  replyTo,
  from,
}) {
  const apiKey =
    process.env.MAILCHIMP_TXN_API_KEY ||
    process.env.MAILCHIMP_TRANSACTIONAL_API_KEY ||
    process.env.MANDRILL_API_KEY ||
    '';

  if (!apiKey) {
    throw new Error('Missing Mailchimp Transactional API key');
  }

  const fromValue = from || process.env.EMAIL_FROM || '';
  const fromEmailFallback = process.env.CONTACT_EMAIL || '';
  const { email: fromEmail, name: fromName } = parseFrom(
    fromValue,
    fromEmailFallback
  );
  if (!fromEmail) {
    throw new Error('Missing from email');
  }

  const toRecipients = mergeUniqueRecipients(to);
  if (!toRecipients.length) {
    throw new Error('Missing recipient email');
  }

  const seen = new Set(toRecipients.map((email) => email.toLowerCase()));
  const recipients = toRecipients.map((email) => ({
    email,
    type: 'to',
  }));

  mergeUniqueRecipients(cc).forEach((email) => {
    const key = email.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    recipients.push({
      email,
      type: 'cc',
    });
  });

  const payload = {
    key: apiKey,
    message: {
      html,
      subject,
      from_email: fromEmail,
      from_name: fromName || undefined,
      to: recipients,
      headers: replyTo ? { 'Reply-To': replyTo } : undefined,
      attachments: mapAttachments(attachments),
    },
  };

  const response = await fetch(MAILCHIMP_TXN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Mailchimp Transactional error: ${response.status} ${text}`
    );
  }

  return response.json();
}

async function sendEmail({
  to,
  cc,
  subject,
  html,
  attachments,
  replyTo,
  provider,
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

  const requestedProvider = normalizeProvider(
    provider || process.env.EMAIL_PROVIDER
  );

  if (
    requestedProvider === 'mailchimp' ||
    requestedProvider === 'mailchimp_marketing'
  ) {
    return sendViaMailchimpMarketing({
      to: mergeUniqueRecipients(to, cc),
      subject,
      html,
      replyTo,
    });
  }

  if (
    requestedProvider === 'mailchimp_transactional' ||
    requestedProvider === 'mailchimp_txn' ||
    requestedProvider === 'mandrill'
  ) {
    return sendViaMailchimpTransactional({
      to,
      cc,
      subject,
      html,
      attachments,
      replyTo,
      from,
    });
  }

  if (!requestedProvider && hasMailchimpTransactionalConfig()) {
    return sendViaMailchimpTransactional({
      to,
      cc,
      subject,
      html,
      attachments,
      replyTo,
      from,
    });
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
