// TourPage.jsx
import React, { useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import GenericCarousel from '../../components/GenericCarrousel';
import TourInfoContainer from './TourInfoContainer';
import WeeklyGrid from '../../components/calendarTool/WeeklyGrid';
import { useFetch } from '../../api/useFetch';
import { fetchPublicData, tourCacheKey } from '../../services/bookingService';

import img1 from '../../res/pexels-hillaryfox-1615815.jpg';
import img2 from '../../res/pexels-pixabay-461936.jpg';
import img3 from '../../res/pexels-fotios-photos-1599497.jpg';

import { useLocation, useParams } from 'react-router-dom';

function TourPage({ tours, bookings, loading, error, createBookingHandler }) {
  const location = useLocation();
  const { tourId } = useParams();
  const { status: tourStatus } = useFetch(tourCacheKey(tourId), fetchPublicData);
  const fetchedTour = tourStatus.kind === 'success' && tourStatus.body.kind === 'json'
    ? tourStatus.body.json?.tour
    : undefined;
  const routeTour = tours.find((tour) => (tour.slug || tour.title.replace(/\s+/g, '-').toLowerCase()) === tourId);
  const tourData = { ...routeTour, ...location.state, ...fetchedTour };
  const tourName =
    tourData.title?.trim() ||
    tourData.name?.trim() ||
    routeTour?.title ||
    tourId.replace(/-/g, ' ');
  const resolvedTourData = { ...tourData, slug: tourData.slug || tourId, title: tourName };
  const { hash } = location;  

  const handleCreateBooking = async (bookingData) => {
    try {
      const response = await createBookingHandler(bookingData); // API call
      return response;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);

  if (tourStatus.kind === 'non-success' && tourStatus.response.status === 404 && !routeTour) {
    return <p role="alert">Tour not found.</p>;
  }

  return (
    <div className="home-surface">
      <GenericCarousel
        key={tourId}
        title={tourName}
        items={(tourData.carouselImages?.length ? tourData.carouselImages : [img1, img2, img3])
          .map((imgSrc) => ({ imgSrc }))}
      />

      <TourInfoContainer tourData={resolvedTourData} />

      <div id="time-slots" className="section-background pt-16 pb-10 py-10 px-4">
        <h2 className="text-5xl font-bold text-white mb-10 text-center">Select a Time Slot</h2>

        {error ? (
          <div className="text-danger text-center">{error}</div>
        ) : (
          <WeeklyGrid
            tourData={resolvedTourData}
            createBookingHandler={handleCreateBooking}
            bookings={loading ? null : bookings}
          />
        )}
      </div>
    </div>
  );
}

export default TourPage;
