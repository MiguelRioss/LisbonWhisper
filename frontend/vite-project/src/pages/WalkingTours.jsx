import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CoinExpansionGrid from '../components/CoinExpansionGrid';
import TourLoadStatus, { TourCatalogStatus } from '../components/TourLoadStatus';
import { useTourCatalog, useTourDetails } from '../services/tourResources';
import { TourCalendar } from './tourPage/TourBookingSections';
import TourInfoContainer from './tourPage/TourInfoContainer';
import logo from '../res/logo.png';

function AnimatedTourTitle({ title }) {
  const displayTitle = title.replace(/\bWhispers$/i, 'Whisper');
  return (
    <>
      <span className="sr-only">{displayTitle}</span>
      {displayTitle.split(/\s+/).map((word, wordIndex) => (
        <span key={wordIndex} className="social-causes-title-word walking-choice-word" aria-hidden="true">
          {Array.from(word, (letter, index) => (
            <span key={index} style={{ '--letter-delay': `${(wordIndex * 7 + index) * 36}ms` }}>{letter}</span>
          ))}
        </span>
      ))}
    </>
  );
}

function SelectedTour({ detail }) {
  const tour = detail.data?.tour;

  if (tour?.title) {
    return (
      <TourInfoContainer
        tourData={tour}
        showImages={false}
        availability={
          <div className="walking-calendar-reveal walking-calendar-inline">
            <TourCalendar tour={tour} dateStrip />
          </div>
        }
      />
    );
  }
  if (detail.loading) return <TourLoadStatus message="Loading tour…" />;
  if (detail.statusCode === 404) return <TourLoadStatus message="Tour not found." />;
  return <TourLoadStatus message="Unable to load this tour." onRetry={detail.refetch} />;
}

export default function WalkingTours() {
  const { hash, key } = useLocation();
  const tourSelection = useRef(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const [bookingTour, setBookingTour] = useState(null);
  const detail = useTourDetails(bookingTour);

  function handleTourSelection(slug) {
    setSelectedTour(slug);
    if (slug) setBookingTour(slug);
  }

  useEffect(() => {
    if (hash !== '#choose-a-tour') return;
    const frame = requestAnimationFrame(() => tourSelection.current?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);

  const catalog = useTourCatalog();
  const tours = catalog.tours ?? [];
  const tourChoices = tours.map((tour) => ({
    id: tour.slug,
    name: tour.title,
    displayName: <AnimatedTourTitle title={tour.title} />,
    artwork: tour.image && <img className="walking-choice-image" src={tour.image} alt="" />,
    details: bookingTour === tour.slug ? <SelectedTour detail={detail} /> : null,
  }));

  return (
    <div className="about-page walking-page">
      <section className="walking-routes" id="choose-a-tour" ref={tourSelection} style={{ scrollMarginTop: 100 }}>
        <div className="walking-routes-inner">
          <div className="about-hero-overlay walking-selection-overlay" data-tour-selected={Boolean(selectedTour) || undefined}>
            <img className="walking-selection-logo" src={logo} alt="Lisbon Whisper" width="48" height="48" />
            <h1 className="about-hero-title">Walking Tours</h1>
            <p className="about-hero-description">
              Discover Lisbon on foot with curated routes that highlight viewpoints, history, and
              the city&#39;s most atmospheric neighborhoods.
            </p>
            <p className="walking-selection-hint">Select a tour photo to see the route and available times.</p>
          </div>
          {tourChoices.length ? (
            <div className="walking-tour-choices">
              <CoinExpansionGrid items={tourChoices} backLabel="← All tours" onSelectionChange={handleTourSelection} showDetailsHeading={false} />
            </div>
          ) : <TourCatalogStatus catalog={catalog} />}
        </div>
      </section>
    </div>
  );
}
