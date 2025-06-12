import React, { useState } from 'react';
import './ComingSoon.css';

const PASSWORD = 'yourpassword123'; // Set your password

export default function ComingSoon({ onSuccess }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pass === PASSWORD) {
      onSuccess();
    } else {
      setError('Incorrect password, try again.');
    }
  };

  return (
    <div className="coming-soon-container">
      <div className="coming-soon-box">
        <h1>Protected Access</h1>
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
