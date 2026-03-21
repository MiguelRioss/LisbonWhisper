const API_BASE = 'https://lisbonwhisper.onrender.com';

export const sendContactForm = async (contact) => {
  const response = await fetch(`${API_BASE}/contact-form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contact }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send contact form: ${response.statusText}`);
  }

  return response.json();
};
