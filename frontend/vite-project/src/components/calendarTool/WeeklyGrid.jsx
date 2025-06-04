import React, { useState } from 'react';
import './WeeklyGrid.css';
import BookingCell from './BookingCell';

const timeSlots = [
    "10:00", "11:30", "14:00", "15:30", "17:30", "18:30", "20:00", "21:30"
];



const WeeklyGrid = ({createBookingHandler,tourData, bookings}) => {
    const { title, descriptions } = tourData; // Destructure state
    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
    const [expandedSlot, setExpandedSlot] = useState(null);


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
    console.log("bookings: ", bookings);
    // Handle loading state if availability is null or undefined
    if (bookings == null ) {
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
            <button className="px-4 py-2 font-medium text-white rounded-md
  bg-gradient-to-b from-[#1a1a1a] to-[#2f2f3f] border border-gray-600
  hover:from-[#2a2a2a] hover:to-[#3f3f4f] transition duration-200">
  ← Previous Week
</button>


                <h3>
                    {weekDates[0].date} - {weekDates[6].date}
                </h3>
                <button className="px-4 py-2 font-medium text-white rounded-md
                    bg-gradient-to-b from-[#1a1a1a] to-[#2f2f3f] border border-gray-600
                    hover:from-[#2a2a2a] hover:to-[#3f3f4f] transition duration-200">
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
                      
                        return (
                           <BookingCell
                            createBookingHandler={createBookingHandler}
                            tourName={title}
                            tourDescriptions={descriptions}
                            key={`${slotIndex}-${dayIndex}`}
                            date={date.date}
                            time={slot}
                            isBooked={bookings.some(
                                (booking) => booking.date === date.date && booking.time === slot
                            )}
                            isExpanded={expandedSlot === `${date.date}-${slot}`}
                            onSelect={() => setExpandedSlot(`${date.date}-${slot}`)}
                            onCollapse={() => setExpandedSlot(null)}
                            />
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
