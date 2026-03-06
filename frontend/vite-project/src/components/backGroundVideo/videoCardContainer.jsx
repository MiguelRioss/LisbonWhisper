import { useEffect, useRef, useState } from 'react';
import IntroCardComponent from '../IntroCardComponent';
const localSrc = '/res/FREE_LISBON_VIDEO.mp4';
const mobileSrc = '/res/FREE_LISBON_VIDEO-mobile.mp4';
const posterSrc = '/res/videoPreview.png';

function VideoCard() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [allowPlay, setAllowPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoSrc = isMobile ? mobileSrc : localSrc;

  useEffect(() => {
    const timer = setTimeout(() => setAllowPlay(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.load();
    setIsPlaying(false);
  }, [videoSrc]);

  useEffect(() => {
    if (!allowPlay || !isVisible) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, [allowPlay, isVisible]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-layer relative w-full h-screen overflow-hidden" ref={containerRef}>
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
        src={videoSrc}
        poster={posterSrc}
        onPlaying={() => setIsPlaying(true)}
      />
    </div>
  );
}

export default VideoCard;
