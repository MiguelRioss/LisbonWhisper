import React, { useState } from 'react';
import './WeeklyGrid.css';

const BookingPopup = ({ createBookingHandler, tourName, tourDescriptions, date, time, onCollapse, maxPersons }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [persons, setPersons] = useState(1);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonsChange = (delta) => {
    setPersons((prev) => {
      const newCount = Math.min(Math.max(1, prev + delta), maxPersons);
      return newCount;
    });
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
      ...formData,
      persons,
      date,
      time,
      tourName,
      tourDescriptions
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
    <div className="booking-popup-overlay">
      <div className="booking-popup">
        <button className="modal-close" onClick={onCollapse}>×</button>

        <h2>Book Slot</h2>
        <p className="booking-slot-time">
          <strong>{formatReadableDate(date)} at {time}</strong>
        </p>

        <div className="tour-info">
          <h3>{tourName}</h3>
          <p>{tourDescriptions}</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="popup-form-fields">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <textarea name="message" placeholder="Message (optional)" value={formData.message} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

            <div className="persons-counter">
              <label>Persons:</label>
              <div className="counter-controls">
                <button type="button" onClick={() => handlePersonsChange(-1)} disabled={persons <= 1}>-</button>
                <span>{persons}</span>
                <button type="button" onClick={() => handlePersonsChange(1)} disabled={persons >= maxPersons}>+</button>
              </div>
            </div>

            {/* Contact us message */}
            <div className="persons-contact">
              <p>Contact us for more persons or private tour</p>
              <button
                type="button"
                className="contact-button"
                onClick={() => window.location.href = '/contact'} 
              >
                Contact Us
              </button>
            </div>
          </div>

          <div className="popup-actions">
            <button type="submit">Confirm</button>
            <button type="button" onClick={onCollapse}>Cancel</button>
          </div>
        </form>
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
