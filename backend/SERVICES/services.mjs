import { sendEmailTemplate } from '../EMAIL/sendEmailTemplate.mjs';

//Este modulo Esta responsavel de recolher a data dos parametros/body etc para depois o services
// usar sem ter que se preocupar com isso
export default function (data) {
  return {
    getBookingAndProcessServices,
    createBookingServices,
    sendContactFormServices,
  };

  async function getBookingAndProcessServices(comparador = {}) {
    // Fetch all bookings from the database
    const bookings = await data.getBookings();
    console.log('Fetched bookings:', bookings);

    // If a comparator is provided, filter the bookings to match
    if (Object.keys(comparador).length > 0) {
      const filteredBookings = bookings.filter((booking) => {
        return Object.keys(comparador).every(
          (key) => booking[key] != null && String(booking[key]) === String(comparador[key])
        );
      });
      return filteredBookings;
    }

    // If no comparator is provided, return all bookings
    return bookings;
  }

  async function createBookingServices(bookingObject) {
    const createdBooking = await data.createBooking(bookingObject);

    try {
      await sendEmailTemplate({
        to: String(createdBooking?.email || '').trim(),
        subject:
          process.env.BOOKING_EMAIL_SUBJECT ||
          'Lisbon Whisper booking confirmation',
        template: 'bookingConfirmation.html',
        variables: {
          CustomerName: escapeHtml(createdBooking?.name || 'Guest'),
          TourName: escapeHtml(createdBooking?.tourName || 'Lisbon Whisper Tour'),
          BookingDate: escapeHtml(formatBookingDate(createdBooking?.date)),
          BookingTime: escapeHtml(createdBooking?.time || 'TBD'),
          Persons: escapeHtml(createdBooking?.persons || '1'),
          CustomerEmail: escapeHtml(createdBooking?.email || ''),
          CustomerMessage: escapeHtml(
            createdBooking?.message ? String(createdBooking.message) : 'No additional notes.'
          ),
          WebsiteUrl: process.env.WEBSITE_URL || 'https://www.lisbonwhisper.com',
          ReplyEmail: process.env.REPLY_EMAIL || 'info@lisbonwhisper.com',
          ContactEmail: process.env.CONTACT_EMAIL || 'info@lisbonwhisper.com',
        },
        replyTo: process.env.REPLY_EMAIL || 'info@lisbonwhisper.com',
        from: process.env.EMAIL_FROM || 'Lisbon Whisper <info@lisbonwhisper.com>',
        provider: process.env.EMAIL_PROVIDER || '',
      });
    } catch (err) {
      console.error('Booking confirmation email failed', {
        message: err.message,
      });
    }

    try {
      await sendEmailTemplate({
        to: process.env.ADMIN_NOTICE_EMAIL || 'info@lisbonwhisper.com',
        subject: process.env.BOOKING_ADMIN_SUBJECT || 'New booking received',
        template: 'bookingAdminNotice.html',
        variables: {
          CustomerName: escapeHtml(createdBooking?.name || ''),
          CustomerEmail: escapeHtml(createdBooking?.email || ''),
          BookingDate: escapeHtml(createdBooking?.date || ''),
          BookingTime: escapeHtml(createdBooking?.time || ''),
          TourName: escapeHtml(createdBooking?.tourName || ''),
          Persons: escapeHtml(createdBooking?.persons || ''),
          CustomerMessage: escapeHtml(createdBooking?.message || ''),
          WebsiteUrl: process.env.WEBSITE_URL || 'https://www.lisbonwhisper.com',
          ContactEmail: process.env.CONTACT_EMAIL || 'info@lisbonwhisper.com',
        },
        replyTo: process.env.REPLY_EMAIL || 'info@lisbonwhisper.com',
        from: process.env.EMAIL_FROM || 'Lisbon Whisper <info@lisbonwhisper.com>',
        provider: process.env.EMAIL_PROVIDER || '',
      });
    } catch (err) {
      console.error('Booking admin notice email failed', {
        message: err.message,
      });
    }

    return createdBooking;
  }

  async function sendContactFormServices(contactObject) {
    const name = String(contactObject?.name || '').trim();
    const email = String(contactObject?.email || '').trim();
    const message = String(contactObject?.message || '').trim();

    if (!name || !email || !message) {
      throw { status: 400, message: 'name, email and message are required' };
    }

    const response = await sendEmailTemplate({
      to: process.env.ADMIN_NOTICE_EMAIL || 'info@lisbonwhisper.com',
      subject: process.env.CONTACT_ADMIN_SUBJECT || 'New contact form submission',
      template: 'contactFormAdminNotice.html',
      variables: {
        Name: escapeHtml(contactObject?.name || ''),
        Email: escapeHtml(contactObject?.email || ''),
        Phone: escapeHtml(contactObject?.phone || ''),
        Message: escapeHtml(contactObject?.message || ''),
        WebsiteUrl: process.env.WEBSITE_URL || 'https://www.lisbonwhisper.com',
        ContactEmail: process.env.CONTACT_EMAIL || 'info@lisbonwhisper.com',
      },
      replyTo: contactObject?.email || process.env.REPLY_EMAIL || 'info@lisbonwhisper.com',
      from: process.env.EMAIL_FROM || 'Lisbon Whisper <info@lisbonwhisper.com>',
      provider: process.env.EMAIL_PROVIDER || '',
    });
    return {
      status: 'Contact form sent',
      providerResult: response,
    };
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBookingDate(isoDate) {
  if (!isoDate) return 'TBD';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return String(isoDate);
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
