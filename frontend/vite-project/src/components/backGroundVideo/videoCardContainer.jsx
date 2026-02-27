import IntroCardComponent from '../IntroCardComponent';
const localSrc = '../../res/FREE_LISBON_VIDEO.mp4';

function VideoCard() {
  return (
    <div className="hero-layer relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 z-10 mt-10">
        <IntroCardComponent />
      </div>
      <a className="hero-scroll-cta hero-scroll-cta--bottom" href="#tours">
        <span className="hero-scroll-arrow">↓</span>
        <span className="hero-scroll-text">See Our Tours</span>
      </a>

      <video
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={localSrc}
      />
    </div>
  );
}

export default VideoCard;
