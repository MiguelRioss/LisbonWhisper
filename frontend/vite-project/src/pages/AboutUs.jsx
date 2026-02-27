import React, { useEffect, useState } from 'react';

function AboutUs() {
  const guides = [
    {
      name: 'Pedro Santana',
      role: 'Tour Guide',
      description:
        "Responsible for leading tours and providing informative, engaging commentary on Lisbon's history, culture, and landmarks.",
      image: '/res/pexels-photo-1534560.jpeg',
    },
    {
      name: 'Pepsi',
      role: 'Storyteller',
      description:
        "A trusted finder of Lisbon's hidden gems and secrets, crafting immersive stories that bring the city to life.",
      image: '/res/pexels-hillaryfox-1615815.jpg',
    },
    {
      name: 'Pedro Dias',
      role: 'Tour Guide',
      description:
        'Skilled in the art of storytelling, creating captivating narratives during tours and special experiences.',
      image: '/res/pexels-pixabay-461936.jpg',
    },
  ];

  const [activeGuide, setActiveGuide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGuide((prev) => (prev + 1) % guides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [guides.length]);

  return (
    <div className="about-page">
      <section className="about-hero-full">
        <div className="about-hero-media">
          <div className="about-hero-placeholder">Hero Image Placeholder</div>
        </div>
        <div className="about-hero-overlay">
          <p className="about-hero-kicker">Lisbon Whisper</p>
          <h1 className="about-hero-title">About Us</h1>
          <p className="about-hero-description">
            Experience Lisbon&apos;s hidden stories with a team of passionate locals. We
            craft walking tours that blend culture, history, and authentic encounters.
          </p>
        </div>
      </section>

      <section className="about-intro">
        <h2 className="about-section-title">About Lisbon Whisper</h2>
        <p className="about-section-text">
          Lisbon Whisper exists to make every visit feel personal. We design immersive
          experiences that go beyond the usual landmarks, connecting you with the city&apos;s
          character, flavors, and untold stories.
        </p>
      </section>

      <section className="about-two-column about-two-column--right">
        <div className="about-two-column-inner">
          <div className="about-two-column-content">
            <h2 className="about-section-title">Why choose us</h2>
            <p className="about-section-text">
              Embark on an unforgettable journey with Lisbon Whisper, where we redefine
              travel experiences to leave you spellbound:
            </p>
            <ul className="about-list">
              <li>
                <strong>Personalized Walking Tours:</strong> Delve into Lisbon&apos;s iconic
                landmarks and hidden gems guided by our passionate locals.
              </li>
              <li>
                <strong>Storytelling Workshops:</strong> Craft your own tales about
                Lisbon&apos;s vibrant history and culture in interactive sessions.
              </li>
              <li>
                <strong>Private Tours:</strong> Tailored adventures for individuals or
                small groups, ensuring an exclusive exploration of the city&apos;s treasures.
              </li>
            </ul>
          </div>
          <div className="about-two-column-image">
            <div className="about-image-placeholder">Image Placeholder</div>
          </div>
        </div>
      </section>

      <section className="about-two-column about-two-column--left">
        <div className="about-two-column-inner">
          <div className="about-two-column-image">
            <div className="team-carousel">
              <div
                className="team-carousel-track"
                style={{ transform: `translateX(-${activeGuide * 100}%)` }}
              >
                {guides.map((guide) => (
                  <div className="team-slide" key={guide.name}>
                    <div className="team-avatar">
                      <img src={guide.image} alt={guide.name} />
                    </div>
                    <h3 className="team-name">{guide.name}</h3>
                    <p className="team-role">{guide.role}</p>
                    <p className="team-description">{guide.description}</p>
                  </div>
                ))}
              </div>
              <div className="team-dots" aria-hidden="true">
                {guides.map((guide, index) => (
                  <span
                    key={guide.name}
                    className={`team-dot ${index === activeGuide ? 'team-dot--active' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="about-two-column-content">
            <h2 className="about-section-title">Our Team</h2>
            <p className="about-section-text">
              Our storytellers, guides, and creators are Lisbon locals who know the
              rhythms of the city by heart. Together, we design experiences that feel
              intimate, thoughtful, and unforgettable.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
