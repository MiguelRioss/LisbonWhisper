import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './WeeklyGrid.css';
import BookingCell from './BookingCell';
import BookingPopup from './BookingPopup';

const timeSlots = ['9:00-11:00', '10:00-12:00', '14:00-16:00', '15:00-17:00', '16:00-18:00'];
const MOBILE_BREAKPOINT = 900;
const SMALL_SCREEN_BREAKPOINT = 600;
const MOBILE_VISIBLE_DAYS = 3;
const DESKTOP_VISIBLE_DAYS = 7;

const WeeklyGrid = ({ createBookingHandler, tourData, bookings }) => {
  const { title, descriptions } = tourData;
  const [currentMonday, setCurrentMonday] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= SMALL_SCREEN_BREAKPOINT
      ? new Date()
      : getMonday(new Date())
  );
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [fadeTransition, setFadeTransition] = useState(true);
  const [hasChangedWeek, setHasChangedWeek] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1200 : window.innerWidth);

  // Lock body scroll when modal is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (expandedSlot !== null) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expandedSlot]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
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

  const visibleDays = viewportWidth <= SMALL_SCREEN_BREAKPOINT ? 1 : viewportWidth <= MOBILE_BREAKPOINT ? MOBILE_VISIBLE_DAYS : DESKTOP_VISIBLE_DAYS;
  const navigationLabel = visibleDays === 1 ? 'Day' : visibleDays === 3 ? '3 Days' : 'Week';
  const weekDates = generateDates(currentMonday, visibleDays);
  const navigationStep = visibleDays;

  const triggerFade = (callback) => {
    if (!fadeTransition) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      callback();
      setHasChangedWeek(true);
      return;
    }
    setFadeTransition(false);
    setTimeout(() => {
      callback();
      setHasChangedWeek(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setFadeTransition(true)));
    }, 240);
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
        <button onClick={handlePreviousWeek} className="grid-nav-button" type="button" disabled={!fadeTransition}>
          <span className="grid-nav-arrow" aria-hidden="true">
            &larr;
          </span>
          <span>Previous {navigationLabel}</span>
        </button>

        <h3 className="grid-nav-range">
          {weekDates[0].date} - {weekDates[weekDates.length - 1].date}
        </h3>

        <button onClick={handleNextWeek} className="grid-nav-button" type="button" disabled={!fadeTransition}>
          <span>Next {navigationLabel}</span>
          <span className="grid-nav-arrow" aria-hidden="true">
            &rarr;
          </span>
        </button>
      </div>

      {/* Weekly Grid */}
      <div
        key={`${weekDates[0].date}-${visibleDays}`}
        className={`grid-container ${fadeTransition ? '' : 'grid-container-changing'} ${hasChangedWeek ? 'grid-container-rebuild' : ''}`}
        style={{ gridTemplateColumns: `repeat(${weekDates.length}, minmax(0, 1fr))` }}
      >
        {/* Header */}
        {weekDates.map((date, index) => (
          <div key={date.date} className="grid-header-cell" style={{ '--piece-index': index }}>
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
                  pieceIndex={weekDates.length + slotIndex * weekDates.length + dayIndex}
                  onSelect={() => setExpandedSlot(slotKey)}
                />
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Booking Popup rendered outside the grid */}
      {expandedSlot && createPortal(
        <BookingPopup
          createBookingHandler={createBookingHandler}
          tourName={title}
          tourDescriptions={descriptions}
          date={getDateFromSlotKey(expandedSlot)}
          time={getTimeFromSlotKey(expandedSlot)}
          onCollapse={() => setExpandedSlot(null)}
          maxPersons={8}
        />, document.body
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
