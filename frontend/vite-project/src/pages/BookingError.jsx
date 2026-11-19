import { Link, useLocation } from 'react-router-dom';
import './BookingResult.css';

export default function BookingError() {
  const cancelled = useLocation().pathname === '/booking/cancel';

  return (
    <section className="booking-result" aria-labelledby="booking-result-title">
      <div className="booking-result-card">
        <span className="booking-result-icon booking-result-icon--error" aria-hidden="true">!</span>
        <p className="booking-result-eyebrow">Lisbon Whisper · Booking</p>
        <h1 id="booking-result-title">{cancelled ? 'Checkout cancelled' : 'We couldn’t confirm your checkout'}</h1>
        <p>{cancelled ? 'Your checkout was cancelled and this booking has not been confirmed.' : 'The checkout link is incomplete. If you made a payment, please contact us before trying again.'}</p>
        <div className="booking-result-actions">
          <Link to="/walking-tours">Try again</Link>
          <Link to="/contact-us" className="booking-result-secondary">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
