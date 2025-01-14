import React, { useState } from 'react';
import './TourCalendar.css'; // Create a CSS file for styling

const TourCalendar = ({ onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const days = [];

        // Empty cells for days before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
        }

        // Days of the month
        for (let date = 1; date <= lastDate; date++) {
            days.push(
                <div
                    key={date}
                    className="calendar-cell"
                    onClick={() => onDateSelect(`${year}-${month + 1}-${date}`)}
                >
                    {date}
                </div>
            );
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <div className="tour-calendar">
            <div className="calendar-header">
                <button className="btn btn-secondary" onClick={handlePrevMonth}>
                    ← Prev
                </button>
                <h3>
                    {currentDate.toLocaleString('default', { month: 'long' })}{' '}
                    {currentDate.getFullYear()}
                </h3>
                <button className="btn btn-secondary" onClick={handleNextMonth}>
                    Next →
                </button>
            </div>
            <div className="calendar-grid">{renderCalendar()}</div>
        </div>
    );
};

export default TourCalendar;
