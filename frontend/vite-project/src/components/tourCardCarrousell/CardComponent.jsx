import React, { useEffect, useRef, useState } from 'react';

const posterMap = {
  '/res/Free_videoLisbon_AI_GENERATED.mp4': '/res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg',
  '/res/LisbonDownTown.mp4': '/res/9bfee964e2a50ec45dc449890ec9ed42.jpg',
};

function TourTile({ title, subtitle, videoSrc, onExplore, showOverlay = true }) {
  const posterSrc = posterMap[videoSrc] || '/res/pexels-fotios-photos-1599497.jpg';
  const tileRef = useRef(null);
  const videoRef = useRef(null);
  const [allowPlay, setAllowPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAllowPlay(true), 3000);
    return () => clearTimeout(timer);
  }, []);

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
    const el = tileRef.current;
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
    <div className="tour-tile" ref={tileRef}>
      <div className="tour-tile-media">
        <img className="tour-video-poster" src={posterSrc} alt="" aria-hidden="true" />
        <video
          ref={videoRef}
          className={`tour-video video-fade ${isPlaying ? 'is-playing' : ''}`}
          loop
          muted
          playsInline
          preload={isVisible ? 'metadata' : 'none'}
          poster={posterSrc}
          onPlaying={() => setIsPlaying(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      {showOverlay ? (
        <div className="tour-tile-overlay">
          <h3 className="tour-tile-title">{title}</h3>
          {subtitle ? <p className="tour-tile-subtitle">{subtitle}</p> : null}
        </div>
      ) : null}

      <button onClick={onExplore} className="tour-tile-cta tour-tile-cta--corner">
        <span className="tour-cta-icon">→</span>
        <span className="tour-cta-text">Explorar</span>
      </button>
    </div>
  );
}

function DetailPanel({ descriptions, subtitle, title, onExplore, mode = 'default' }) {
  if (mode === 'fullText') {
    const match = title.match(/^The\s+(.*)$/i);
    const prefix = match ? 'The' : '';
    const mainTitle = match ? match[1] : title;
    return (
      <div className="tour-detail-panel">
        <div className="tour-detail-box tour-detail-box--header">
          <h3 className="tour-detail-title">
            {prefix ? <span className="tour-detail-prefix">{prefix} </span> : null}
            <span className="tour-detail-outline">{mainTitle}</span>
          </h3>
          {subtitle ? <p className="tour-detail-text">{subtitle}</p> : null}
        </div>
        <div className="tour-detail-box">
          {descriptions[1] ? <p className="tour-detail-text">{descriptions[1]}</p> : null}
          {descriptions[2] ? <p className="tour-detail-text">{descriptions[2]}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="tour-detail-panel">
      <div className="tour-detail-box">
        <p className="tour-detail-text">{descriptions[1] ?? subtitle}</p>
      </div>
      <div className="tour-detail-box">
        <p className="tour-detail-text">{descriptions[2] ?? ''}</p>
      </div>
    </div>
  );
}

export function LeftMediaRow({ title, descriptions = [], videoSrc, handleShowMoreWithParams }) {
  const subtitle = descriptions[0] ?? '';
  return (
    <div className="tour-row">
      <TourTile
        title={title}
        subtitle={subtitle}
        videoSrc={videoSrc}
        onExplore={() => handleShowMoreWithParams(title, descriptions, videoSrc)}
        showOverlay={false}
      />
      <DetailPanel
        descriptions={descriptions}
        subtitle={subtitle}
        title={title}
        onExplore={() => handleShowMoreWithParams(title, descriptions, videoSrc)}
        mode="fullText"
      />
    </div>
  );
}

export function RightMediaRow({ title, descriptions = [], videoSrc, handleShowMoreWithParams }) {
  const subtitle = descriptions[0] ?? '';
  return (
    <div className="tour-row tour-row--reverse">
      <TourTile
        title={title}
        subtitle={subtitle}
        videoSrc={videoSrc}
        onExplore={() => handleShowMoreWithParams(title, descriptions, videoSrc)}
        showOverlay={false}
      />
      <DetailPanel
        descriptions={descriptions}
        subtitle={subtitle}
        title={title}
        onExplore={() => handleShowMoreWithParams(title, descriptions, videoSrc)}
        mode="fullText"
      />
    </div>
  );
}

export default function CardComp(props) {
  return <LeftMediaRow {...props} />;
}
