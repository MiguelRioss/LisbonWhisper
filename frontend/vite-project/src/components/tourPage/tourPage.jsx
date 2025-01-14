import React, { useState } from 'react';
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

function TourPage() {
    const location = useLocation();
    const tourData = location.state || {};
    console.log(tourData);

    const availability = {
        "2025-01-10": { "21:30": "Book Now" },
        "2025-01-11": { "10:00": "Book Now", "11:30": "Sold Out", "14:00": "Sold Out" },
        "2025-01-12": { "10:00": "Book Now", "18:30": "Sold Out" },
    };

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
            <WeeklyGrid
                availability={availability}
                onSlotSelect={handleSlotSelect}
            />
        </>
    );
}

export default TourPage;
