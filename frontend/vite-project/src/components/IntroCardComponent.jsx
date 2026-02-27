import React, { useEffect, useState } from 'react';
import logo from '../res/logo.png';

function IntroCardComponent() {
  const words = ['Corner', 'Castle', 'View', 'Food', 'Myth']; // Array of words
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Index of the current word
  const [visible, setVisible] = useState(true); // To toggle visibility

  // Function to update the word index and visibility
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false); // Start fade out

      setTimeout(() => {
        // After fade out completes, change word
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length); // Move to the next word
        setVisible(true); // Start fade in
      }, 500); // Change word after 0.5 seconds of fade out
    }, 4000); // Every 4 seconds, a new word is shown

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);

  return (
    <div className="introText hero-type text-center text-white">
      <div className="introLogo">
        <img src={logo} alt="Lisbon Whisper logo" className="hero-logo hero-logo-animate" />
      </div>
      <div className="introLine">
        <div className="textBox1">
          <h1 className="text-2xl md:text-4xl lg:text-5xl hero-soft">Every</h1>
        </div>
        <div className="textBox2">
          <h1 className="text-3xl md:text-5xl lg:text-6xl">
            <span
              className={`animated-word hero-emphasis ${visible ? 'fade-in-down' : 'fade-out-down'}`}
            >
              {words[currentWordIndex]}
            </span>
          </h1>
        </div>
        <div className="textBox3">
          <h1 className="text-xl md:text-3xl lg:text-4xl hero-soft">
            holds a secret in Lisbon
          </h1>
        </div>
      </div>
    </div>
  );
}

export default IntroCardComponent;
