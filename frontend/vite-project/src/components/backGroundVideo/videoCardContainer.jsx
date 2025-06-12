import IntroCardComponent from '../IntroCardComponent';
const localSrc = '../../res/FREE_LISBON_VIDEO.mp4';

function VideoCard() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 z-10 mt-10">
        <IntroCardComponent />
      </div>

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
