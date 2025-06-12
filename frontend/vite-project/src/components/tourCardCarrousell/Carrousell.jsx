import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import CardComp from './CardComponent';

function Carrousel({ cardData }) {
    const navigate = useNavigate();

    const handleNavigateToTourPage = (title, descriptions, videoSrc) => {
        navigate(`/tour/${title.replace(/\s+/g, '-').toLowerCase()}`, { state: { title, descriptions, videoSrc } });
    };

    return (
        <div id="carouselExampleIndicators" className="carousel carousel-slide slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
                {cardData.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        data-bs-target="#carouselExampleIndicators"
                        data-bs-slide-to={index}
                        className={index === 0 ? 'active' : ''}
                        aria-current={index === 0 ? 'true' : undefined}
                        aria-label={`Slide ${index + 1}`}
                    ></button>
                ))}
            </div>

            <div className="carousel-inner">
                {cardData.map((data, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                        {/* Pass navigation logic to CardComp */}
                        <CardComp
                            title={data.title}
                            descriptions={data.descriptions}
                            videoSrc={data.videoSrc}
                            backgroundImage={data.backgroundImage}
                            handleShowMoreWithParams={handleNavigateToTourPage} // Pass function
                        />
                    </div>
                ))}
            </div>

            {/* Carousel controls */}
            <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="prev"
            >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="next"
            >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
}

export default Carrousel;
