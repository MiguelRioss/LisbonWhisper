import React from 'react';
import './WeeklyGrid.css';

const BookingCell = ({ isBooked, time, onSelect }) => {
  const status = isBooked ? 'Sold Out' : 'Book Now';

  return (
    <div
      className={`time-slot-cell ${isBooked ? 'sold-out' : ''}`}
      onClick={!isBooked ? onSelect : undefined}
    >
      <div className="slot-content">
        <div className="slot-time">{time}</div>
        <div className={`slot-status ${isBooked ? 'sold' : 'available'}`}>{status}</div>
      </div>
    </div>
  );
};

export default BookingCell;
