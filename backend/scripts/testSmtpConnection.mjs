import 'dotenv/config';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp-mail.outlook.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE =
  process.env.SMTP_SECURE != null
    ? ['1', 'true', 'yes', 'on'].includes(String(process.env.SMTP_SECURE).toLowerCase())
    : SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

async function run() {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('Missing SMTP credentials.');
    console.error('Set SMTP_USER and SMTP_PASS in backend/.env.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  console.log('Testing SMTP connection...');
  console.log(`Host: ${SMTP_HOST}`);
  console.log(`Port: ${SMTP_PORT}`);
  console.log(`Secure: ${SMTP_SECURE}`);
  console.log(`User: ${SMTP_USER}`);

  try {
    await transporter.verify();
    console.log('SMTP connection successful.');
  } catch (error) {
    console.error('SMTP connection failed.');
    console.error(error?.message || error);
    process.exit(1);
  }
}

run();
