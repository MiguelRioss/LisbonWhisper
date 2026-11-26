import { Link } from 'react-router-dom';
import TourInfoContainer from './TourInfoContainer';
import WeeklyGrid from '../../components/calendarTool/WeeklyGrid';
import TourLoadStatus from '../../components/TourLoadStatus';
import { createBooking } from '../../services/bookingService';
import { useTourAvailability } from '../../services/tourResources';

export function TourCalendar({ tour, dateStrip = false }) {
  const hasBookingInfo = Boolean(tour.title) &&
    Number.isInteger(tour.priceCents) && tour.priceCents > 0 &&
    Number.isInteger(tour.maxPersons) && tour.maxPersons > 0;
  const availability = useTourAvailability(hasBookingInfo);

  return (
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
          dateStrip={dateStrip}
        />
      )}
    </div>
  );
}

export function TourContact({ showSteps = false }) {
  return (
    <section className="walking-steps">
      {showSteps && <div className="walking-steps-inner">
        <div className="walking-step-card">
          <h3>1. Pick your style</h3>
          <p>
            Tell us if you want history, photography, or neighborhood food. We will match you
            with the right guide.
          </p>
        </div>
        <div className="walking-step-card">
          <h3>2. Meet your guide</h3>
          <p>
            We keep start points central and easy to reach. Your guide brings the city to life
            with stories and local tips.
          </p>
        </div>
        <div className="walking-step-card">
          <h3>3. Keep exploring</h3>
          <p>
            End with a curated list of cafes, viewpoints, and hidden corners to keep discovering
            Lisbon on your own.
          </p>
        </div>
      </div>}
      <div className="walking-cta">
        <p>Want a private version or a custom route?</p>
        <Link className="private-cta" to="/contact-us">
          Contact us
        </Link>
      </div>
    </section>
  );
}

export default function TourBookingSections({ tour }) {
  return (
    <>
      <section className="walking-intro">
        <div className="walking-intro-inner">
          <div className="walking-intro-copy">
            <h2 className="walking-intro-title">Walk Slow, See More</h2>
            <p className="walking-intro-text">
              Our walking tours are crafted for travelers who want to feel the rhythm of Lisbon.
              We keep groups small, mix iconic sights with hidden alleys, and leave room for
              spontaneous moments.
            </p>
          </div>
          <div className="walking-stats">
            <div className="walking-stat">
              <span className="walking-stat-value">2-3h</span>
              <span className="walking-stat-label">Typical length</span>
            </div>
            <div className="walking-stat">
              <span className="walking-stat-value">{Number.isInteger(tour.maxPersons) && tour.maxPersons > 0 ? tour.maxPersons : '—'}</span>
              <span className="walking-stat-label">Guests max</span>
            </div>
            <div className="walking-stat">
              <span className="walking-stat-value">Daily</span>
              <span className="walking-stat-label">Tours available</span>
            </div>
          </div>
        </div>
      </section>
      <TourInfoContainer tourData={tour} />
      <TourCalendar tour={tour} />
      <TourContact showSteps />
    </>
  );
}
