import { Link, useNavigate } from 'react-router-dom';
import { TourCatalogStatus } from '../components/TourLoadStatus';
import { useTourCatalog } from '../services/tourResources';

export default function WalkingTours() {
  const navigate = useNavigate();
  const catalog = useTourCatalog();
  const tours = catalog.tours ?? [];
  const groupSizes = tours.map(({ maxPersons }) => maxPersons).filter((size) => Number.isInteger(size) && size > 0);
  const handleNavigateToTourPage = (tour) => {
    navigate(`/tour/${tour.slug}`);
  };

  const handleCardKeyDown = (event, tour) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigateToTourPage(tour);
    }
  };

  return (
    <div className="about-page walking-page">
      <section className="about-hero-full">
        <div className="about-hero-media">
          <img
            className="about-hero-image"
            src="/res/9bfee964e2a50ec45dc449890ec9ed42.jpg"
            alt="Lisbon streets"
          />
        </div>
        <div className="about-hero-overlay">
          <p className="about-hero-kicker">Lisbon Whisper</p>
          <h1 className="about-hero-title">Walking Tours</h1>
          <p className="about-hero-description">
            Discover Lisbon on foot with curated routes that highlight viewpoints, history, and
            the city&#39;s most atmospheric neighborhoods.
          </p>
        </div>
      </section>

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
              <span className="walking-stat-value">{groupSizes.length ? Math.max(...groupSizes) : '—'}</span>
              <span className="walking-stat-label">Guests max</span>
            </div>
            <div className="walking-stat">
              <span className="walking-stat-value">Daily</span>
              <span className="walking-stat-label">Tours available</span>
            </div>
          </div>
        </div>
      </section>

      <section className="walking-routes">
        <div className="walking-routes-inner">
          <h2 className="walking-section-title">Signature routes</h2>
          {tours.length ? <div className="walking-route-grid walking-route-grid--two">
            {tours.map((tour) => (
              <div
                key={tour.slug}
                className="walking-route-card"
                style={{ backgroundImage: `url('${tour.image}')` }}
                role="button"
                tabIndex={0}
                onClick={() => handleNavigateToTourPage(tour)}
                onKeyDown={(event) => handleCardKeyDown(event, tour)}
                aria-label={`Open ${tour.title} tour`}
              >
                <div className="walking-route-overlay">
                  <span className="walking-tag">{tour.tag}</span>
                  <h3>{tour.title}</h3>
                  <p>{tour.description}</p>
                </div>
              </div>
            ))}
          </div> : <TourCatalogStatus catalog={catalog} />}
        </div>
      </section>

      <section className="walking-steps">
        <div className="walking-steps-inner">
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
        </div>
        <div className="walking-cta">
          <p>Want a private version or a custom route?</p>
          <Link className="private-cta" to="/contact-us">
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}
