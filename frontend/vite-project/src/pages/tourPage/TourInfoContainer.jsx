// TourInfoContainer.js
import React from 'react';
function TourInfoContainer({ tourData }) {
  const { title, descriptions } = tourData; // Destructure state
  const safeDescriptions = Array.isArray(descriptions) ? descriptions : [];
  const combinedDescriptions = safeDescriptions.reduce((accumulator, currentArray) => {
    return accumulator.concat(currentArray);
  }, []);
  const normalizedTitle = (title ?? '').toLowerCase();
  const mainImage =
    normalizedTitle.includes('moorish')
      ? '/res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg'
      : normalizedTitle.includes('west')
      ? '/res/9bfee964e2a50ec45dc449890ec9ed42.jpg'
      : '/res/pexels-fotios-photos-1599497.jpg';
  const contactImage = '/res/pexels-fotios-photos-1599497.jpg';

  return (
    <div className="tour-info-section">
      <section className="about-two-column about-two-column--right">
        <div className="about-two-column-inner">
          <div className="about-two-column-content">
            <h2 className="about-section-title">Tour Overview</h2>
            {combinedDescriptions.map((desc, index) => (
              <p key={index} className="about-section-text">
                {desc}
              </p>
            ))}
          </div>
          <div className="about-two-column-image">
            <img className="about-image" src={mainImage} alt={title || 'Tour'} />
          </div>
        </div>
      </section>

      <section className="about-two-column about-two-column--left">
        <div className="about-two-column-inner">
          <div className="about-two-column-image">
            <img className="about-image" src={contactImage} alt="Lisbon" />
          </div>
          <div className="about-two-column-content">
            <h2 className="about-section-title">Check Availability</h2>
            <p className="about-section-text">
              Ready to book your spot? See the available time slots and choose the one that fits
              your plans.
            </p>
            <ul className="tour-detail-list">
              <li>
                <strong>Starting point:</strong> Hard Rock Cafe, Restauradores
              </li>
              <li>
                <strong>Price:</strong> €34 <span className="tour-old-price">€49</span>
              </li>
              <li>
                <strong>Group size:</strong> 1-8 pax
              </li>
            </ul>
            <a className="private-cta" href="#time-slots">
              Check availability
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TourInfoContainer;
