import React from 'react';
import './WeeklyGrid.css';

const BookingCell = ({ isBooked, time, onSelect, pieceIndex }) => {
  const status = isBooked ? 'Sold Out' : 'Book Now';

  return (
    <button
      type="button"
      disabled={isBooked}
      aria-label={`${time}, ${status}`}
      className={`time-slot-cell ${isBooked ? 'sold-out' : ''}`}
      style={{ '--piece-index': pieceIndex }}
      onClick={onSelect}
    >
      <div className="slot-content">
        <div className="slot-time">{time}</div>
        <div className={`slot-status ${isBooked ? 'sold' : 'available'}`}>{status}</div>
      </div>
    </button>
  );
};

export default BookingCell;
