import crypto from 'node:crypto';

const DEFAULT_SUBSCRIBE_STATUS = 'subscribed';

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

function deriveServerPrefix(apiKey) {
  const raw = String(apiKey || '').trim();
  const match = raw.match(/-([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : '';
}

function resolveDefaultAddressMergeField() {
  const rawJson = String(process.env.MAILCHIMP_DEFAULT_ADDRESS_JSON || '').trim();
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === 'object') {
        return {
          addr1: String(parsed.addr1 || '').trim(),
          addr2: String(parsed.addr2 || '').trim(),
          city: String(parsed.city || '').trim(),
          state: String(parsed.state || '').trim(),
          zip: String(parsed.zip || '').trim(),
          country: String(parsed.country || '').trim().toUpperCase(),
        };
      }
    } catch {
      // Ignore invalid JSON and fallback to discrete env vars below.
    }
  }

  const addr1 = String(process.env.MAILCHIMP_DEFAULT_ADDRESS_ADDR1 || '').trim();
  const city = String(process.env.MAILCHIMP_DEFAULT_ADDRESS_CITY || '').trim();
  const country = String(process.env.MAILCHIMP_DEFAULT_ADDRESS_COUNTRY || '')
    .trim()
    .toUpperCase();
  const addr2 = String(process.env.MAILCHIMP_DEFAULT_ADDRESS_ADDR2 || '').trim();
  const state = String(process.env.MAILCHIMP_DEFAULT_ADDRESS_STATE || '').trim();
  const zip = String(process.env.MAILCHIMP_DEFAULT_ADDRESS_ZIP || '').trim();

  if (!addr1 || !city || !country) {
    return null;
  }

  return { addr1, addr2, city, state, zip, country };
}

function resolveMailchimpConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY || '';
  const serverPrefix =
    process.env.MAILCHIMP_SERVER_PREFIX || deriveServerPrefix(apiKey);
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID || '';
  const fromName = process.env.MAILCHIMP_FROM_NAME || '';
  const fromEmail = process.env.MAILCHIMP_FROM_EMAIL || '';
  const replyTo = process.env.MAILCHIMP_REPLY_TO || '';

  const fromValue = process.env.EMAIL_FROM || '';
  const fromEmailFallback = process.env.CONTACT_EMAIL || '';
  const parsedFrom = parseFrom(fromValue, fromEmailFallback);

  const resolvedFromName = fromName || parsedFrom.name || 'Lisbon Whisper';
  const resolvedFromEmail =
    fromEmail || parsedFrom.email || process.env.CONTACT_EMAIL || '';
  const resolvedReplyTo = replyTo || resolvedFromEmail;

  if (!apiKey) {
    throw new Error('Missing MAILCHIMP_API_KEY');
  }
  if (!serverPrefix) {
    throw new Error('Missing MAILCHIMP_SERVER_PREFIX');
  }
  if (!audienceId) {
    throw new Error('Missing MAILCHIMP_AUDIENCE_ID');
  }
  if (!resolvedFromName) {
    throw new Error('Missing Mailchimp from name');
  }
  if (!resolvedFromEmail) {
    throw new Error('Missing Mailchimp from email');
  }

  return {
    apiKey,
    serverPrefix,
    audienceId,
    fromName: resolvedFromName,
    fromEmail: resolvedFromEmail,
    replyTo: resolvedReplyTo,
  };
}

function resolveMailchimpPingConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY || '';
  const serverPrefix =
    process.env.MAILCHIMP_SERVER_PREFIX || deriveServerPrefix(apiKey);

  if (!apiKey) {
    throw new Error('Missing MAILCHIMP_API_KEY');
  }
  if (!serverPrefix) {
    throw new Error('Missing MAILCHIMP_SERVER_PREFIX');
  }

  return { apiKey, serverPrefix };
}

function resolveMailchimpAudienceConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY || '';
  const serverPrefix =
    process.env.MAILCHIMP_SERVER_PREFIX || deriveServerPrefix(apiKey);
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID || '';

  if (!apiKey) {
    throw new Error('Missing MAILCHIMP_API_KEY');
  }
  if (!serverPrefix) {
    throw new Error('Missing MAILCHIMP_SERVER_PREFIX');
  }
  if (!audienceId) {
    throw new Error('Missing MAILCHIMP_AUDIENCE_ID');
  }

  return {
    apiKey,
    serverPrefix,
    audienceId,
  };
}

function buildAuthHeader(apiKey) {
  const token = Buffer.from(`anystring:${apiKey}`).toString('base64');
  return `Basic ${token}`;
}

async function mailchimpRequest(config, path, options = {}) {
  const { serverPrefix, apiKey } = config;
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: buildAuthHeader(apiKey),
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mailchimp Marketing error: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function buildCampaignTitle(subject) {
  const timestamp = new Date().toISOString().slice(0, 19);
  return `${subject} (${timestamp})`;
}

async function createCampaign(config, subject, replyTo, savedSegmentId) {
  const recipients = {
    list_id: config.audienceId,
  };
  if (savedSegmentId) {
    recipients.segment_opts = {
      saved_segment_id: savedSegmentId,
    };
  }

  const payload = {
    type: 'regular',
    recipients,
    settings: {
      subject_line: subject,
      title: buildCampaignTitle(subject),
      from_name: config.fromName,
      reply_to: replyTo || config.replyTo,
    },
  };

  const response = await mailchimpRequest(config, '/campaigns', {
    method: 'POST',
    body: payload,
  });

  return response?.id;
}

async function setCampaignContent(config, campaignId, html) {
  await mailchimpRequest(config, `/campaigns/${campaignId}/content`, {
    method: 'PUT',
    body: { html },
  });
}

async function sendCampaign(config, campaignId) {
  await mailchimpRequest(config, `/campaigns/${campaignId}/actions/send`, {
    method: 'POST',
  });
}

async function createTemporarySegment(config, recipients) {
  const name = `tmp-targeted-${Date.now()}`;
  const response = await mailchimpRequest(
    config,
    `/lists/${config.audienceId}/segments`,
    {
      method: 'POST',
      body: {
        name,
        static_segment: recipients,
      },
    }
  );
  const segmentId = response?.id;
  if (!segmentId) {
    throw new Error('Mailchimp Marketing did not return a segment id');
  }
  return segmentId;
}

async function deleteTemporarySegment(config, segmentId) {
  if (!segmentId) return;
  try {
    await mailchimpRequest(
      config,
      `/lists/${config.audienceId}/segments/${segmentId}`,
      { method: 'DELETE' }
    );
  } catch (err) {
    console.warn('Mailchimp segment cleanup failed', {
      segmentId,
      message: err.message,
    });
  }
}

function hashEmail(email) {
  return crypto
    .createHash('md5')
    .update(String(email || '').trim().toLowerCase())
    .digest('hex');
}

async function addOrUpdateAudienceMember(config, { email, firstName, lastName, status }) {
  if (!email) {
    throw new Error('Missing email for Mailchimp audience sync');
  }

  const subscriberHash = hashEmail(email);
  const subscribeStatus =
    status || process.env.MAILCHIMP_SUBSCRIBE_STATUS || DEFAULT_SUBSCRIBE_STATUS;

  const mergeFields = {};
  if (firstName) mergeFields.FNAME = firstName;
  if (lastName) mergeFields.LNAME = lastName;
  const defaultAddress = resolveDefaultAddressMergeField();
  if (defaultAddress) mergeFields.ADDRESS = defaultAddress;

  const payload = {
    email_address: email,
    status_if_new: subscribeStatus,
    status: subscribeStatus,
  };
  if (Object.keys(mergeFields).length > 0) {
    payload.merge_fields = mergeFields;
  }

  return mailchimpRequest(config, `/lists/${config.audienceId}/members/${subscriberHash}`, {
    method: 'PUT',
    body: payload,
  });
}

async function ensureRecipientsSubscribed(config, recipients = []) {
  for (const email of recipients) {
    await addOrUpdateAudienceMember(config, {
      email,
      status: 'subscribed',
    });
  }
}

async function sendViaMailchimpMarketing({ to, subject, html, replyTo }) {
  const config = resolveMailchimpConfig();
  const recipients = normalizeRecipients(to);
  if (!recipients.length) {
    throw new Error('Mailchimp delivery requires explicit recipient emails');
  }

  let segmentId = null;
  let campaignId = null;
  let sendTriggered = false;

  try {
    await ensureRecipientsSubscribed(config, recipients);
    segmentId = await createTemporarySegment(config, recipients);
    campaignId = await createCampaign(
      config,
      subject || '(no subject)',
      replyTo,
      segmentId
    );
    if (!campaignId) {
      throw new Error('Mailchimp Marketing did not return a campaign id');
    }

    await setCampaignContent(config, campaignId, html);
    await sendCampaign(config, campaignId);
    sendTriggered = true;
  } finally {
    if (!sendTriggered) {
      await deleteTemporarySegment(config, segmentId);
    } else if (segmentId) {
      console.log('Mailchimp targeted send kept temporary segment for delivery safety', {
        campaignId,
        segmentId,
      });
    }
  }

  return {
    campaignId,
    mode: 'targeted_send',
    recipients,
    requestedRecipients: recipients,
    segmentId,
  };
}

async function verifyMailchimpMarketingConnection() {
  const config = resolveMailchimpPingConfig();
  await mailchimpRequest(config, '/ping');
  return { ok: true, transport: 'mailchimp_marketing' };
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

async function getAudienceMembers({ count = 100, offset = 0 } = {}) {
  const config = resolveMailchimpAudienceConfig();
  const safeCount = clampNumber(count, 1, 1000, 100);
  const safeOffset = clampNumber(offset, 0, 100000, 0);

  const params = new URLSearchParams({
    count: String(safeCount),
    offset: String(safeOffset),
    sort_field: 'timestamp_opt',
    sort_dir: 'DESC',
  });

  const response = await mailchimpRequest(
    config,
    `/lists/${config.audienceId}/members?${params.toString()}`
  );

  const members = Array.isArray(response?.members) ? response.members : [];

  return {
    audienceId: config.audienceId,
    totalItems: Number(response?.total_items || 0),
    count: members.length,
    members: members.map((member) => ({
      id: member?.id || '',
      email: member?.email_address || '',
      status: member?.status || '',
      firstName: member?.merge_fields?.FNAME || '',
      lastName: member?.merge_fields?.LNAME || '',
      fullName: member?.full_name || '',
      memberRating: member?.member_rating ?? null,
      lastChanged: member?.last_changed || '',
      timestampSignup: member?.timestamp_signup || '',
      timestampOpt: member?.timestamp_opt || '',
      tagsCount: Array.isArray(member?.tags) ? member.tags.length : 0,
      language: member?.language || '',
      source: member?.source || '',
    })),
  };
}

export { sendViaMailchimpMarketing, verifyMailchimpMarketingConnection, getAudienceMembers };
