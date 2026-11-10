
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeftMediaRow, RightMediaRow } from './CardComponent';

function Carrousel({ cardData }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleNavigateToTourPage = (title, descriptions, videoSrc) => {
    navigate(`/tour/${title.replace(/\s+/g, '-').toLowerCase()}`, {
      state: { title, descriptions, videoSrc },
    });
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="tours" className="tours-section" ref={sectionRef}>

      {/* Clean, modern section header */}
      <div className="mx-auto max-w-3xl px-6 pt-14 pb-10 text-center">

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          DISCOVER LISBON
        </p>

        <h2
          className={`tours-section-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900 ${
            isVisible ? 'fade-left' : 'fade-left-init'
          }`}
        >
          Our Walking Tours
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700">
          Discover Lisbon beyond the ordinary. Explore historic
          streets, hidden viewpoints and local stories through
          our small-group walking tours.
        </p>

      </div>

      {/* Existing tour cards remain unchanged */}
      <div className="tours-grid">
        {cardData.map((data, index) => {
          const RowComponent =
            index % 2 === 0 ? RightMediaRow : LeftMediaRow;

          return (
            <RowComponent
              key={index}
              title={data.title}
              descriptions={data.descriptions}
              videoSrc={data.videoSrc}
              handleShowMoreWithParams={handleNavigateToTourPage}
            />
          );
        })}
      </div>

    </section>
  );
}

export default Carrousel;
