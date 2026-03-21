import React, { useEffect, useState } from 'react';

function AboutUs() {
  const guides = [
    {
      name: 'Pedro Figueiredo',
      role: 'Tour Guide',
      description:
        "Responsible for leading tours and providing informative, engaging commentary on Lisbon's history, culture, and landmarks.",
      image:
        'https://b0265ce9b8.clvaw-cdnwnd.com/2ccb01ce5441f44e1f63eb8db8873e7c/200000234-7f15b7f15d/pedro.figueiredo_2.png?ph=b0265ce9b8',
    },
    {
      name: 'Pepsi',
      role: 'Storyteller',
      description:
        "A trusted finder of Lisbon's hidden gems and secrets, crafting immersive stories that bring the city to life.",
      image:
        'https://b0265ce9b8.clvaw-cdnwnd.com/2ccb01ce5441f44e1f63eb8db8873e7c/200000200-2323d23242/pepsi_dog.png?ph=b0265ce9b8',
    },
    {
      name: 'Pedro Dias',
      role: 'Tour Guide',
      description:
        'Skilled in the art of storytelling, creating captivating narratives during tours and special experiences.',
      image:
        'https://b0265ce9b8.clvaw-cdnwnd.com/2ccb01ce5441f44e1f63eb8db8873e7c/200000202-341d2341d5/unnamed.png?ph=b0265ce9b8',
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
          <img
            className="about-hero-image"
            src="/res/image-doors.jpg"
            alt="Lisbon doors"
          />
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
        <h2 className="about-section-title">About LisbonWhisper</h2>
        <p className="about-section-text">
          Lisbon Whisper is not just a tour, it&apos;s your way into the real Lisbon.
          <br />
          <br />
          We take you beyond the crowds, through hidden streets, untold stories, and
          authentic local moments. This is where Lisbon stops being a destination... and
          starts becoming your experience.
        </p>
      </section>

      <section className="about-two-column about-two-column--right">
        <div className="about-two-column-inner">
          <div className="about-two-column-content">
            <h2 className="about-section-title">Why choose Lisbon Whisper?</h2>
            <ul className="about-list">
              <li>
                <strong>Authentic &amp; immersive experience:</strong> Discover Lisbon&apos;s
                hidden secrets through unique routes, guided by passionate locals who turn
                every walk into a living story.
              </li>
              <li>
                <strong>Traditional flavors included:</strong> Enjoy authentic moments
                with ginjinha and pastel de nata, thoughtfully integrated into the
                journey for a truly local experience.
              </li>
              <li>
                <strong>Full flexibility &amp; personalization:</strong> Choose between
                guided, semi-guided, or private tours, tailored to your pace for an
                exclusive and memorable experience.
              </li>
            </ul>
          </div>
          <div className="about-two-column-image">
            <img
              className="about-image"
              src="/res/about-us-secttion.jpeg"
              alt="About Lisbon Whisper"
            />
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
