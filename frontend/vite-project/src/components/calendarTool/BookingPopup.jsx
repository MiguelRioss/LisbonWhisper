import React, { useState } from 'react';
import './WeeklyGrid.css';

const BookingPopup = ({
  createBookingHandler,
  tourName,
  tourDescriptions,
  date,
  time,
  onCollapse,
  maxPersons,
}) => {
  const PRICE_PER_PERSON = 49;
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [persons, setPersons] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverPricing, setServerPricing] = useState(null);

  const estimatedTotal = persons * PRICE_PER_PERSON;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonsChange = (delta) => {
    setPersons((prev) => Math.min(Math.max(1, prev + delta), maxPersons));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
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
      tourDescriptions,
    };

    try {
      setIsSubmitting(true);
      const response = await createBookingHandler(booking);
      const createdBooking = response?.booking || null;
      setServerPricing({
        pricePerPerson: createdBooking?.pricePerPerson,
        totalPrice: createdBooking?.totalPrice,
        currency: createdBooking?.currency || 'EUR',
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit booking.');
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

            <div className="booking-side-section">
              <h4>Booking Information</h4>
              <div className="persons-counter">
                <label>Persons:</label>
                <div className="counter-controls">
                  <button
                    type="button"
                    onClick={() => handlePersonsChange(-1)}
                    disabled={isSubmitting || persons <= 1}
                  >
                    -
                  </button>
                  <span>{persons}</span>
                  <button
                    type="button"
                    onClick={() => handlePersonsChange(1)}
                    disabled={isSubmitting || persons >= maxPersons}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="booking-price-summary">
                <p>
                  <strong>Price per person:</strong>{' '}
                  <span className="booking-current-price">{`\u20AC${PRICE_PER_PERSON}`}</span>{' '}
                </p>
                <p>
                  <strong>Estimated total:</strong> {`\u20AC${estimatedTotal}`}
                </p>
              </div>
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
          </div>

          <form onSubmit={handleSubmit}>
            <h3 className="contact-details-title">Contact Details</h3>
            {error && <div className="form-error">{error}</div>}

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
            </div>

            <div className="popup-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Confirm booking'}
              </button>
              <button type="button" onClick={onCollapse} disabled={isSubmitting}>
                Cancel
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
