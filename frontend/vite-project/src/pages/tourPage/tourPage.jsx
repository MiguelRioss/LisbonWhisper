// TourPage.jsx
import React, { useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import GenericCarousel from '../../components/GenericCarrousel';
import TourInfoContainer from './TourInfoContainer';
import WeeklyGrid from '../../components/calendarTool/WeeklyGrid';
import TourLoadStatus from '../../components/TourLoadStatus';
import { createBooking } from '../../services/bookingService';
import { useTourAvailability, useTourDetails } from '../../services/tourResources';

import { useLocation, useParams } from 'react-router-dom';

function TourPage() {
  const { hash } = useLocation();
  const { tourId } = useParams();
  const detail = useTourDetails(tourId);
  const tour = detail.data?.tour;
  const hasBookingInfo = Boolean(tour?.title) &&
    Number.isInteger(tour.priceCents) && tour.priceCents > 0 &&
    Number.isInteger(tour.maxPersons) && tour.maxPersons > 0;
  const availability = useTourAvailability(hasBookingInfo);

  useEffect(() => {
    if (!hash || !tour) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, tour]);

  if (!tour?.title) {
    if (detail.loading) return <TourLoadStatus message="Loading tour…" />;
    if (detail.statusCode === 404) return <TourLoadStatus message="Tour not found." />;
    return <TourLoadStatus message="Unable to load this tour." onRetry={detail.refetch} />;
  }

  return (
    <div className="home-surface">
      <GenericCarousel
        key={tourId}
        title={tour.title}
        items={(tour.carouselImages?.length ? tour.carouselImages : [tour.image].filter(Boolean))
          .map((imgSrc) => ({ imgSrc }))}
      />

      <TourInfoContainer tourData={tour} />

      <div id="time-slots" className="section-background pt-16 pb-10 py-10 px-4">
        <h2 className="text-5xl font-bold text-white mb-10 text-center">Select a Time Slot</h2>

        {!hasBookingInfo ? (
          <TourLoadStatus message="Online booking is currently unavailable for this tour." />
        ) : !availability.loading && !availability.bookings ? (
          <TourLoadStatus message="Unable to load availability." onRetry={availability.refetch} />
        ) : (
          <WeeklyGrid
            tourData={tour}
            createBookingHandler={createBooking}
            bookings={availability.bookings ?? null}
          />
        )}
      </div>
    </div>
  );
}

export default TourPage;
