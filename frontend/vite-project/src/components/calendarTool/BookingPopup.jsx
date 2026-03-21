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
  const PRICE_PER_PERSON = 39;
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
    <div className="booking-popup-overlay">
      <div className="booking-popup">
        <button className="modal-close" onClick={onCollapse} disabled={isSubmitting}>
          x
        </button>

        <h2>Book Slot</h2>
        <p className="booking-slot-time">
          <strong>
            {formatReadableDate(date)} at {time}
          </strong>
        </p>

        <div className="booking-content-grid">
          <div className="booking-side-panel">
            <div className="tour-info">
              <h3>{tourName}</h3>
              <p>{tourDescriptions}</p>
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
                  <strong>Price per person:</strong> {PRICE_PER_PERSON} EUR
                </p>
                <p>
                  <strong>Estimated total:</strong> {estimatedTotal} EUR
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
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <textarea
                name="message"
                placeholder="Message (optional)"
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="popup-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Confirm'}
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
