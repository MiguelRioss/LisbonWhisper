import React, { useState } from 'react';
import './WeeklyGrid.css';

const BookingCell = ({
  createBookingHandler,
  tourName,
  tourDescriptions,
  date,
  time,
  isBooked,
  isExpanded,
  onSelect,
  onCollapse,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [error, setError] = useState('');

  const status = isBooked ? 'Sold Out' : 'Book Now';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      name: formData.name,
      email: formData.email,
      message: formData.message,
      date,
      time,
      tourName,
      tourDescriptions,
    };

    try {
      await createBookingHandler(booking);
      alert('Booking submitted!');
      onCollapse();
    } catch (err) {
      console.error(err);
      setError('Failed to submit booking.');
    }
  };

  return (
    <>
      <div
        className={`time-slot-cell ${isBooked ? 'sold-out' : ''}`}
        onClick={!isBooked ? onSelect : undefined}
      >
        {status}
      </div>

      {isExpanded && !isBooked && (
        <div className="booking-popup-overlay">
          <div className="booking-popup">
            <button className="modal-close" onClick={onCollapse}>
              ×
            </button>

            <h2>Book Slot</h2>
            <p className="booking-slot-time">
              <strong>{formatReadableDate(date)} at {time}</strong>
            </p>

            {/* Tour Info Section */}
            <div className="tour-info">
              <h3>{tourName}</h3>
              <p>{tourDescriptions}</p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="popup-form-fields">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="message"
                  placeholder="Message (optional)"
                  value={formData.message}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="popup-actions">
                <button type="submit">Confirm</button>
                <button type="button" onClick={onCollapse}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingCell;

// Utility to display date in readable UK format
const formatReadableDate = (isoDate) => {
  const dateObj = new Date(isoDate);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-GB', { month: 'long' });
  const year = dateObj.getFullYear();
  return `${day} of ${month} ${year}`;
};
