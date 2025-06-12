// LandingPage.jsx
import React from 'react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <header>
        <h1>Welcome to Lisbon Whisper</h1>
      </header>
      <main>
        <p>Explore Lisbon like never before.</p>
        <a href="/tours" className="btn-primary">Explore Tours</a>
      </main>
      <footer>© {new Date().getFullYear()} Lisbon Whisper</footer>
    </div>
  );
}
