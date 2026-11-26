import React, { useState } from 'react';
import { fetchCheckoutQuote } from '../../services/bookingService';
import './WeeklyGrid.css';

const euro = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

const BookingPopup = ({
  createBookingHandler,
  tourName,
  tourId,
  tourDescriptions,
  date,
  time,
  onCollapse,
  maxPersons,
  priceCents,
}) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', promoCode: '' });
  const [persons, setPersons] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [quote, setQuote] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverPricing, setServerPricing] = useState(null);

  const estimatedTotal = persons * priceCents / 100;
  const busy = isSubmitting || isApplyingPromo;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'promoCode') {
      setQuote(null);
      setPromoError('');
      setError('');
    }
  };

  async function applyPromo(guestCount = persons) {
    if (busy || !formData.promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError('');
    setError('');
    setQuote(null);
    try {
      const price = await fetchCheckoutQuote({ tourId, persons: guestCount, promoCode: formData.promoCode });
      setQuote(price);
    } catch (err) {
      setPromoError(err.message);
    } finally {
      setIsApplyingPromo(false);
    }
  }

  const handlePersonsChange = (delta) => {
    if (busy) return;
    const next = Math.min(Math.max(1, persons + delta), maxPersons);
    setPersons(next);
    if (quote) void applyPromo(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email.');
      return;
    }

    const booking = {
      ...formData,
      persons,
      date,
      time,
      tourName,
      tourId,
      tourDescriptions,
    };

    try {
      setIsSubmitting(true);
      const response = await createBookingHandler(booking);
      if (response?.url) {
        window.location.assign(response.url);
        return;
      }
      const createdBooking = response?.booking || null;
      setServerPricing({
        pricePerPerson: createdBooking?.pricePerPerson,
        totalPrice: createdBooking?.totalPrice,
        currency: createdBooking?.currency || 'EUR',
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-popup-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) onCollapse(); }}>
      <div className="booking-popup" role="dialog" aria-modal="true" aria-labelledby="booking-popup-title">
        <button type="button" className="modal-close" aria-label="Close booking dialog" onClick={onCollapse} disabled={isSubmitting}>
          ×
        </button>

        <span className="booking-popup-eyebrow">Lisbon Whisper · Booking</span>
        <h2 id="booking-popup-title">Reserve your place</h2>
        <p className="booking-slot-time">
          <strong>
            {formatReadableDate(date)} at {time}
          </strong>
        </p>

        <div className="booking-content-grid">
          <div className="booking-side-panel">
            <div className="tour-info">
              <h3>{tourName}</h3>
              <p>{Array.isArray(tourDescriptions) ? tourDescriptions[0] : tourDescriptions}</p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>
            <h3 className="contact-details-title">Contact Details</h3>
            {error && <div className="form-error" role="alert">{error}</div>}

            <div className="popup-form-fields">
              <label htmlFor="booking-name">Name</label>
              <input
                id="booking-name"
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <label htmlFor="booking-email">Email</label>
              <input
                id="booking-email"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <label htmlFor="booking-message">Message <span>(optional)</span></label>
              <textarea
                id="booking-message"
                name="message"
                placeholder="Message (optional)"
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <label htmlFor="booking-promo-code">Promo code <span>(optional)</span></label>
              <div className="booking-promo-row">
                <input
                  id="booking-promo-code"
                  name="promoCode"
                  type="text"
                  value={formData.promoCode}
                  onChange={handleChange}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void applyPromo();
                    }
                  }}
                  maxLength={32}
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-invalid={Boolean(promoError)}
                  aria-describedby="booking-promo-hint"
                  disabled={busy}
                />
                <button type="button" onClick={() => applyPromo()} disabled={busy || !formData.promoCode.trim()}>
                  {isApplyingPromo ? 'Applying…' : 'Apply'}
                </button>
              </div>
              <small id="booking-promo-hint" role={promoError ? 'alert' : 'status'}>
                {promoError || (quote ? `${quote.promoCode} applied.` : 'Apply your code to see the discounted total.')}
              </small>
            </div>

            <div className="booking-side-section">
              <h4>Booking Information</h4>
              <div className="persons-counter">
                <label>Persons:</label>
                <div className="counter-controls">
                  <button
                    type="button"
                    onClick={() => handlePersonsChange(-1)}
                    disabled={busy || persons <= 1}
                  >
                    -
                  </button>
                  <span>{persons}</span>
                  <button
                    type="button"
                    onClick={() => handlePersonsChange(1)}
                    disabled={busy || persons >= maxPersons}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="booking-price-summary" aria-live="polite">
                <p>
                  <strong>Price per person:</strong>{' '}
                  <span className="booking-current-price">{euro.format((quote ? quote.subtotalCents / persons : priceCents) / 100)}</span>
                </p>
                {quote ? (
                  <>
                    <p><strong>Subtotal:</strong> {euro.format(quote.subtotalCents / 100)}</p>
                    <p><strong>Discount ({quote.discountPercent}%):</strong> −{euro.format(quote.discountCents / 100)}</p>
                    <p><strong>Total after discount:</strong> {euro.format(quote.totalPriceCents / 100)}</p>
                  </>
                ) : (
                  <p><strong>{isApplyingPromo ? 'Subtotal before discount:' : 'Estimated total:'}</strong> {euro.format(estimatedTotal)}</p>
                )}
              </div>
            </div>

            <div className="popup-actions">
              <button type="submit" disabled={busy}>
                {isSubmitting ? 'Submitting...' : 'Confirm booking'}
              </button>
              <button type="button" onClick={onCollapse} disabled={isSubmitting}>
                Cancel
              </button>
            </div>

            <div className="persons-contact">
              <p>Need more persons or a private tour?</p>
              <button
                type="button"
                className="contact-button"
                disabled={isSubmitting}
                onClick={() => {
                  window.location.href = '/contact-us';
                }}
              >
                Contact Us
              </button>
            </div>
          </form>
        </div>

        {showSuccessModal && (
          <div className="booking-success-overlay" role="dialog" aria-modal="true">
            <div className="booking-success-modal">
              <h3>Thank you</h3>
              <p>Your booking was submitted successfully.</p>
              <p>
                Final total:{' '}
                <strong>
                  {serverPricing?.totalPrice ?? estimatedTotal}{' '}
                  {serverPricing?.currency || 'EUR'}
                </strong>
              </p>
              <p>We will contact you soon with the next details.</p>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onCollapse();
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const formatReadableDate = (isoDate) => {
  const dateObj = new Date(isoDate);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-GB', { month: 'long' });
  const year = dateObj.getFullYear();
  return `${day} of ${month} ${year}`;
};

export default BookingPopup;
