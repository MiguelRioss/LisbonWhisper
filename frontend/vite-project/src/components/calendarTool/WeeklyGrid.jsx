import React, { useState } from 'react';
import './WeeklyGrid.css';

const timeSlots = [
    "10:00", "11:30", "14:00", "15:30", "17:30", "18:30", "20:00", "21:30"
];

const WeeklyGrid = ({ bookings, onSlotSelect }) => {
    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));

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

    const handlePreviousWeek = () => {
        const previousMonday = new Date(currentMonday);
        previousMonday.setDate(currentMonday.getDate() - 7);
        setCurrentMonday(previousMonday);
    };

    const handleNextWeek = () => {
        const nextMonday = new Date(currentMonday);
        nextMonday.setDate(currentMonday.getDate() + 7);
        setCurrentMonday(nextMonday);
    };

    // Handle loading state if availability is null or undefined
    if (!bookings) {
        return (
            <div className="weekly-grid-loading text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Handle empty availability (no data fetched or no slots available)
    if (Object.keys(bookings).length === 0) {
        return <div className="weekly-grid-empty text-center">No availability data found.</div>;
    }

    return (
        <div className="weekly-grid">
            {/* Week Navigation */}
            <div className="grid-navigation">
                <button className="btn btn-secondary" onClick={handlePreviousWeek}>
                    ← Previous Week
                </button>
                <h3>
                    {weekDates[0].date} - {weekDates[6].date}
                </h3>
                <button className="btn btn-secondary" onClick={handleNextWeek}>
                    Next Week →
                </button>
            </div>

            {/* Weekly Grid */}
            <div className="grid-container">
                {/* Header (Days of the Week) */}
                {weekDates.map((date, index) => (
                    <div key={index} className="grid-header-cell">
                        <div className="day">{date.day}</div>
                        <div className="date">{date.date}</div>
                    </div>
                ))}

                {/* Body (Time Slots) */}
                {timeSlots.map((slot, slotIndex) =>
                    weekDates.map((date, dayIndex) => {
                        // Check if there is a booking that matches the current date and time slot
                        const isBooked = bookings.some(
                            (booking) => booking.Date === date.date && booking.time === slot
                        );
                        const status = isBooked ? "Sold Out" : "Book Now";

                        return (
                            <div
                                key={`${slotIndex}-${dayIndex}`}
                                className={`time-slot-cell ${status === "Sold Out" ? "sold-out" : ""}`}
                                onClick={() => {
                                    if (status !== "Sold Out") {
                                        onSlotSelect(date.date, slot);
                                    }
                                }}
                            >
                                {status}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
};

export default WeeklyGrid;
