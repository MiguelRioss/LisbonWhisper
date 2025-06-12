import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function GenericCarousel({ items }) {
  return (
    <div id="carouselExampleFade" className="carousel slide carousel-fade" data-bs-ride="carousel">
      <div className="carousel-inner">
        {items.map((item, index) => (
          <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
            <img
              src={item.imgSrc} // Use the imgSrc prop
              className="d-block w-100"
              alt={`Slide ${index + 1}`}
              style={{ height: '700px', objectFit: 'cover' }} // Set height and cover style
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>{item.text}</h5> {/* Display the text on top of the image */}
            </div>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleFade"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleFade"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default GenericCarousel;
