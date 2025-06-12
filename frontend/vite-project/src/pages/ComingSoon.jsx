// ComingSoon.jsx
import React, { useState } from 'react';
import './ComingSoon.css';
import logo from '../res/logo.png';

const PASSWORD = 'yourpassword123';

export default function ComingSoon({ onSuccess }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pass === PASSWORD) {
      localStorage.setItem('hasAccess', 'true'); // <-- remember
      onSuccess();
    } else {
      setError('Incorrect password. Try again.');
    }
  };

  return (
    <div className="coming-soon-container">
      <div className="coming-soon-box">
        <img src={logo} alt="Lisbon Whisper logo" className="cs-logo" />
        <h1>Coming Soon</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
          <button type="submit">Enter</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
