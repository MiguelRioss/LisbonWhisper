import 'dotenv/config';
import {
  verifyMailchimpMarketingConnection,
} from '../EMAIL/mailchimpMarketing.mjs';

const TXN_ENDPOINT = 'https://mandrillapp.com/api/1.0/users/ping2.json';

function normalizeProvider(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function resolveTxnKey() {
  return (
    process.env.MAILCHIMP_TXN_API_KEY ||
    process.env.MAILCHIMP_TRANSACTIONAL_API_KEY ||
    process.env.MANDRILL_API_KEY ||
    ''
  );
}

async function verifyMailchimpTransactionalConnection() {
  const key = resolveTxnKey();
  if (!key) {
    return { ok: false, reason: 'missing_transactional_api_key' };
  }

  const response = await fetch(TXN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `Mailchimp Transactional verify failed (${response.status}): ${bodyText || response.statusText}`
    );
  }

  return { ok: true, transport: 'mailchimp_transactional' };
}

async function run() {
  const provider = normalizeProvider(process.env.EMAIL_PROVIDER || 'mailchimp');

  console.log('Testing Mailchimp connection...');
  console.log(`Provider: ${provider}`);

  try {
    let result;
    if (provider === 'mailchimp' || provider === 'mailchimp_marketing') {
      result = await verifyMailchimpMarketingConnection();
    } else if (
      provider === 'mailchimp_transactional' ||
      provider === 'mailchimp_txn' ||
      provider === 'mandrill'
    ) {
      result = await verifyMailchimpTransactionalConnection();
    } else {
      throw new Error(
        `Unsupported EMAIL_PROVIDER for this test: ${provider}. Use mailchimp, mailchimp_marketing, mailchimp_transactional, or mandrill.`
      );
    }

    if (!result.ok) {
      console.error(`Mailchimp connection failed: ${result.reason}`);
      process.exit(1);
    }
    console.log(`Mailchimp connection successful via ${result.transport || provider}.`);
  } catch (error) {
    console.error('Mailchimp connection failed.');
    console.error(error?.message || error);
    process.exit(1);
  }
}

run();
