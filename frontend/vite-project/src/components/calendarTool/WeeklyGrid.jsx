import React, { useEffect, useState } from 'react';
import './WeeklyGrid.css';
import BookingCell from './BookingCell';
import BookingPopup from './BookingPopup';

const timeSlots = ['9:00-11:00', '10:00-12:00', '14:00-16:00', '15:00-17:00', '16:00-18:00'];
const MOBILE_BREAKPOINT = 900;
const MOBILE_VISIBLE_DAYS = 3;
const DESKTOP_VISIBLE_DAYS = 7;

const WeeklyGrid = ({ createBookingHandler, tourData, bookings }) => {
  const { title, descriptions } = tourData;
  const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [fadeTransition, setFadeTransition] = useState(true);
  const [isMobile, setIsMobile] = useState(isMobileViewport);

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileViewport());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const generateDates = (startDate, totalDays) => {
    const weekDates = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push({
        day: date.toLocaleString('en-GB', { weekday: 'long' }),
        date: date.toISOString().split('T')[0],
      });
    }
    return weekDates;
  };

  const visibleDays = isMobile ? MOBILE_VISIBLE_DAYS : DESKTOP_VISIBLE_DAYS;
  const weekDates = generateDates(currentMonday, visibleDays);
  const navigationStep = visibleDays;

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
      previousMonday.setDate(currentMonday.getDate() - navigationStep);
      setCurrentMonday(previousMonday);
    });
  };

  const handleNextWeek = () => {
    triggerFade(() => {
      const nextMonday = new Date(currentMonday);
      nextMonday.setDate(currentMonday.getDate() + navigationStep);
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
        <button onClick={handlePreviousWeek} className="grid-nav-button" type="button">
          <span className="grid-nav-arrow" aria-hidden="true">
            &larr;
          </span>
          <span>{isMobile ? 'Previous 3 Days' : 'Previous Week'}</span>
        </button>

        <h3 className="grid-nav-range">
          {weekDates[0].date} - {weekDates[weekDates.length - 1].date}
        </h3>

        <button onClick={handleNextWeek} className="grid-nav-button" type="button">
          <span>{isMobile ? 'Next 3 Days' : 'Next Week'}</span>
          <span className="grid-nav-arrow" aria-hidden="true">
            &rarr;
          </span>
        </button>
      </div>

      {/* Weekly Grid */}
      <div
        className={`grid-container transform transition duration-1000 ease-in-out 
          ${fadeTransition ? 'opacity-200 scale-200' : 'opacity-0 scale-100'}`}
        style={{ gridTemplateColumns: `repeat(${weekDates.length}, minmax(0, 1fr))` }}
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

const isMobileViewport = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= MOBILE_BREAKPOINT;
};

// Helper functions to parse slotKey
const getDateFromSlotKey = (slotKey) => slotKey.split('|')[0];
const getTimeFromSlotKey = (slotKey) => slotKey.split('|')[1];

export default WeeklyGrid;
