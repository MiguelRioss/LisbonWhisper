// TourPage.jsx
import React, { useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import GenericCarousel from '../../components/GenericCarrousel';
import TourBookingSections from './TourBookingSections';
import TourLoadStatus from '../../components/TourLoadStatus';
import { useTourDetails } from '../../services/tourResources';

import { useLocation, useParams } from 'react-router-dom';

function TourPage() {
  const { hash } = useLocation();
  const { tourId } = useParams();
  const detail = useTourDetails(tourId);
  const tour = detail.data?.tour;
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

      <TourBookingSections key={tourId} tour={tour} />
    </div>
  );
}

export default TourPage;
