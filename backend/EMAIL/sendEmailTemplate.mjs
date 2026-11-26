import renderEmail from './emailRenderer.mjs';
import { sendEmail } from './sendEmail.mjs';

async function sendEmailTemplate({
  to,
  cc,
  subject,
  template,
  variables = {},
  replyTo,
  from,
}) {
  if (!template) {
    throw new Error('Missing template');
  }

  const html = renderEmail({
    template,
    variables,
  });

  return sendEmail({
    to,
    cc,
    subject,
    html,
    replyTo,
    from,
  });
}

export { sendEmailTemplate };
