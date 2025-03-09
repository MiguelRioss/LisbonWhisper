import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import GenericCarousel from "../GenericCarrousel";
import TourInfoContainer from './TourInfoContainer';
import WeeklyGrid from '../calendarTool/WeeklyGrid';

// Import images
import img1 from '../../res/pexels-hillaryfox-1615815.jpg';
import img2 from '../../res/pexels-pixabay-461936.jpg';
import img3 from '../../res/pexels-fotios-photos-1599497.jpg';

import { useLocation } from 'react-router-dom';
const apiLink = 'http://localhost:1904';

function TourPage() {
    const location = useLocation();
    const tourData = location.state || {};
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch availability data from API
    const fetchAvailability = async () => {
        try {
            const response = await fetch(apiLink + '/bookings');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAvailability(data.bookings);
        } catch (err) {
            console.error('Error fetching availability:', err);
            setError('Failed to fetch availability data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchAvailability();

        // Set up auto-refresh every 30 seconds
        const intervalId = setInterval(() => {
            console.log('Refreshing availability data...');
            fetchAvailability();
        }, 30000); // 30 seconds

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures this runs only on mount

    const handleSlotSelect = (date, time) => {
        console.log(`Selected ${date} at ${time}`);
        alert(`You selected ${date} at ${time}`);
        // Implement booking logic here
    };

    return (
        <>
            {/* Carousel */}
            <GenericCarousel items={[
                { text: "First slide", imgSrc: img1 },
                { text: "Second slide", imgSrc: img2 },
                { text: "Third slide", imgSrc: img3 }
            ]} />

            {/* Tour Information */}
            <TourInfoContainer tourData={tourData} />

            {/* Weekly Grid */}
            <h2 className="text-center my-4">Select a Time Slot</h2>
            {error ? (
                <div>Error: {error}</div>
            ) : (
                <WeeklyGrid
                    bookings={loading ? null : availability} // Pass null if loading
                    onSlotSelect={handleSlotSelect}
                />
            )}
        </>
    );
}

export default TourPage;
