import React, { useState, useEffect } from 'react';
import './WeeklyGrid.css';
import BookingCell from './BookingCell';
import BookingPopup from './BookingPopup';

const timeSlots = ['9:00-11:00', '10:00-12:00', '14:00-16:00', '15:00-17:00', '16:00-18:00'];

const WeeklyGrid = ({ createBookingHandler, tourData, bookings }) => {
  const { title, descriptions } = tourData;
  const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [fadeTransition, setFadeTransition] = useState(true);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (expandedSlot !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [expandedSlot]);

  const generateWeekDates = (monday) => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push({
        day: date.toLocaleString('default', { weekday: 'long' }),
        date: date.toISOString().split('T')[0],
      });
    }
    return weekDates;
  };

  const weekDates = generateWeekDates(currentMonday);

  const triggerFade = (callback) => {
    setFadeTransition(false);
    setTimeout(() => {
      callback();
      setFadeTransition(true);
    }, 180);
  };

  const handlePreviousWeek = () => {
    triggerFade(() => {
      const previousMonday = new Date(currentMonday);
      previousMonday.setDate(currentMonday.getDate() - 7);
      setCurrentMonday(previousMonday);
    });
  };

  const handleNextWeek = () => {
    triggerFade(() => {
      const nextMonday = new Date(currentMonday);
      nextMonday.setDate(currentMonday.getDate() + 7);
      setCurrentMonday(nextMonday);
    });
  };

  // Handle loading state
  if (bookings == null) {
    return (
      <div className="weekly-grid-loading text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-grid">
      {/* Week Navigation */}
      <div className="grid-navigation">
        <button
          onClick={handlePreviousWeek}
          className="px-4 py-2 font-medium text-white rounded-md
            bg-gradient-to-b from-[#1a1a1a] to-[#2f2f3f] border border-gray-600
            hover:from-[#2a2a2a] hover:to-[#3f3f4f] transition duration-200"
        >
          ← Previous Week
        </button>

        <h3>
          {weekDates[0].date} - {weekDates[6].date}
        </h3>

        <button
          onClick={handleNextWeek}
          className="px-4 py-2 font-medium text-white rounded-md
            bg-gradient-to-b from-[#1a1a1a] to-[#2f2f3f] border border-gray-600
            hover:from-[#2a2a2a] hover:to-[#3f3f4f] transition duration-200"
        >
          Next Week →
        </button>
      </div>

      {/* Weekly Grid */}
      <div
        className={`grid-container transform transition duration-1000 ease-in-out 
          ${fadeTransition ? 'opacity-200 scale-200' : 'opacity-0 scale-100'}`}
      >
        {/* Header */}
        {weekDates.map((date, index) => (
          <div key={index} className="grid-header-cell">
            <div className="day">{date.day}</div>
            <div className="date">{date.date}</div>
          </div>
        ))}

        {/* Time Slots */}
        {timeSlots.map((slot, slotIndex) =>
          weekDates.map((date, dayIndex) => {
            const isBooked = bookings.some(
              (booking) => booking.date === date.date && booking.time === slot
            );
            const slotKey = `${date.date}|${slot}`;
            return (
              <React.Fragment key={`${slotIndex}-${dayIndex}`}>
                <BookingCell
                  isBooked={isBooked}
                  time={slot}
                  onSelect={() => setExpandedSlot(slotKey)}
                />
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Booking Popup rendered outside the grid */}
      {expandedSlot && (
        <BookingPopup
          createBookingHandler={createBookingHandler}
          tourName={title}
          tourDescriptions={descriptions}
          date={getDateFromSlotKey(expandedSlot)}
          time={getTimeFromSlotKey(expandedSlot)}
          onCollapse={() => setExpandedSlot(null)}
          maxPersons={8}
        />
      )}
    </div>
  );
};

// Helpers
const getMonday = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

// Helper functions to parse slotKey
const getDateFromSlotKey = (slotKey) => slotKey.split('|')[0];
const getTimeFromSlotKey = (slotKey) => slotKey.split('|')[1];

export default WeeklyGrid;
