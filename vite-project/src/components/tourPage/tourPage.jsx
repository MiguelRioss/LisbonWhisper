import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import GenericCarousel from "../GenericCarrousel";
import TourInfoContainer from './TourInfoContainer'; // Use the correct case

// Import images directly
import img1 from '../../res/pexels-hillaryfox-1615815.jpg';
import img2 from '../../res/pexels-pixabay-461936.jpg'; // Add the correct file extension
import img3 from '../../res/pexels-fotios-photos-1599497.jpg'; // Add the correct file extension
import { useLocation } from 'react-router-dom';

function TourPage() {
    const location = useLocation()
    const tourData = location.state || {}; 
    console.log(tourData)

    return (
        <>
            {/* Carousel */}
            <GenericCarousel items={[
                { text: "First slide", imgSrc: img1 },
                { text: "Second slide", imgSrc: img2 },
                { text: "Third slide", imgSrc: img3 }
            ]} />
            <TourInfoContainer tourData = {tourData} /> {/* Use the correct casing */}
        </>
    );
}

export default TourPage;
