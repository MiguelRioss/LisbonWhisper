// TourPage.jsx
import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import GenericCarousel from "../GenericCarrousel";
import TourInfoContainer from './TourInfoContainer';
import WeeklyGrid from '../calendarTool/WeeklyGrid';

import img1 from '../../res/pexels-hillaryfox-1615815.jpg';
import img2 from '../../res/pexels-pixabay-461936.jpg';
import img3 from '../../res/pexels-fotios-photos-1599497.jpg';

import { useLocation } from 'react-router-dom';

function TourPage({ bookings, loading, error, createBookingHandler,refetchBookings  }) {
  const location = useLocation();
  const tourData = location.state || {};

  const [availability, setAvailability] = useState([]);

    const handleCreateBooking = async (bookingData) => {
      try {
        const response = await createBookingHandler(bookingData); // API call
        await refetchBookings(); // fetch fresh data from server
        setAvailability((prev) => [...prev, bookingData]); // Update local state immediately
        return response;
      } catch (err) {
        throw err;
      }
    };


  return (
    <div className='section-background'>
      <GenericCarousel items={[
        { text: "First slide", imgSrc: img1 },
        { text: "Second slide", imgSrc: img2 },
        { text: "Third slide", imgSrc: img3 }
      ]} />

      <TourInfoContainer tourData={tourData} />

<div className="section-background pt-16 pb-10 py-10 px-4">
  <h2 className="text-5xl font-bold text-white mb-10 text-center">
    Select a Time Slot
  </h2>




    {error ? (
      <div className="text-danger text-center">{error}</div>
    ) : (
      <WeeklyGrid
        tourData={tourData}
        createBookingHandler={handleCreateBooking}
        bookings={loading ? null : bookings}
      />
    )}
  </div>
</div>


  
  );
}

export default TourPage;
