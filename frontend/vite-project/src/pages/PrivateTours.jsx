export default function PrivateTours() {
  return (
    <div className="about-page private-page">
      <section className="about-hero-full">
        <div className="about-hero-media">
          <img className="about-hero-image" src="/res/sintra.jpg" alt="Sintra" />
        </div>
        <div className="about-hero-overlay">
          <p className="about-hero-kicker">Lisbon Whisper</p>
          <h1 className="about-hero-title">Private Tours</h1>
          <p className="about-hero-description">
            Curated Lisbon and Sintra journeys designed just for you, with a private guide and
            flexible timing.
          </p>
        </div>
      </section>

      <section className="about-two-column about-two-column--right">
        <div className="about-two-column-inner">
          <div className="about-two-column-content">
            <h2 className="about-section-title">Designed around your pace</h2>
            <p className="about-section-text">
              We build the day around your interests, energy, and travel style. From hidden alleys
              to grand viewpoints, each stop is planned to match the story you want to experience.
            </p>
            <ul className="about-list">
              <li>
                <strong>Custom routes:</strong> Mix historic quarters, food markets, and photo
                stops.
              </li>
              <li>
                <strong>Flexible timing:</strong> Morning, afternoon, or full-day itineraries.
              </li>
              <li>
                <strong>Private guide:</strong> A local storyteller dedicated to your group.
              </li>
            </ul>
          </div>
          <div className="about-two-column-image">
            <img
              className="about-image"
              src="/res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg"
              alt="Lisbon viewpoint"
            />
          </div>
        </div>
      </section>

      <section className="about-two-column about-two-column--left">
        <div className="about-two-column-inner">
          <div className="about-two-column-image">
            <img
              className="about-image"
              src="/res/pexels-fotios-photos-1599497.jpg"
              alt="Lisbon streets"
            />
          </div>
          <div className="about-two-column-content">
            <h2 className="about-section-title">Request a private offer</h2>
            <p className="about-section-text">
              Private tours are tailored to your group size, date, and preferred themes. Contact
              us with your wish list and we will craft a personalized proposal.
            </p>
            <a className="private-cta" href="/contact-us">
              Contact us to receive an offer
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
