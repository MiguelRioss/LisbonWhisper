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
    <div id="tours" className="tours-section" ref={sectionRef}>
      <div className="tours-header">
        <h2 className={`tours-header-title ${isVisible ? 'fade-left' : 'fade-left-init'}`}>
          Our <span className="tours-header-outline">Walking Tours</span>
        </h2>
        <img
          src="/tour-route.png"
          alt="Tour route"
          className={`tours-header-image ${isVisible ? 'fade-left' : 'fade-left-init'} fade-left-delay`}
        />
      </div>

      <div className="tours-grid">
        {cardData.map((data, index) => {
          const RowComponent = index % 2 === 0 ?   RightMediaRow: LeftMediaRow;
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
    </div>
  );
}

export default Carrousel;
