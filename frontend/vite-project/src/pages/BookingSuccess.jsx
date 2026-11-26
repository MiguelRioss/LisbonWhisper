import { Link, Navigate, useSearchParams } from 'react-router-dom';
import './BookingResult.css';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  if (!sessionId) return <Navigate to="/booking/error" replace />;

  return (
    <section className="booking-result" aria-labelledby="booking-result-title">
      <div className="booking-result-card">
        <span className="booking-result-icon booking-result-icon--success" aria-hidden="true">✓</span>
        <p className="booking-result-eyebrow">Lisbon Whisper · Booking</p>
        <h1 id="booking-result-title">Thank you for booking</h1>
        <p>Your checkout is complete. We’ll send a confirmation email once your booking is verified.</p>
        <p className="booking-result-note">Please keep the email you used at checkout. If you need help, include your checkout reference when contacting us.</p>
        <div className="booking-result-actions">
          <Link to="/">Return home</Link>
          <Link to="/contact-us" className="booking-result-secondary">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
