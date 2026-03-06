import { useEffect, useRef, useState } from 'react';
import IntroCardComponent from '../IntroCardComponent';
const localSrc = '/res/FREE_LISBON_VIDEO.mp4';
const posterSrc = '/res/videoPreview.png';

function VideoCard() {
  const videoRef = useRef(null);
  const [allowPlay, setAllowPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAllowPlay(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!allowPlay) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, [allowPlay]);

  return (
    <div className="hero-layer relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 z-10 mt-10">
        <IntroCardComponent />
      </div>
      <a className="hero-scroll-cta hero-scroll-cta--bottom" href="#tours">
        <span className="hero-scroll-arrow">↓</span>
        <span className="hero-scroll-text">See Our Tours</span>
      </a>

      <img className="hero-video-poster" src={posterSrc} alt="" aria-hidden="true" />
      <video
        className={`hero-video video-fade ${isPlaying ? 'is-playing' : ''}`}
        ref={videoRef}
        loop
        muted
        playsInline
        preload="metadata"
        src={localSrc}
        poster={posterSrc}
        onPlaying={() => setIsPlaying(true)}
      />
    </div>
  );
}

export default VideoCard;
