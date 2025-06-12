import IntroCardComponent from '../IntroCardComponent';
const src = 'https://www.youtube.com/watch?v=5DD5lNwc7ho';
const localSrc = '../../res/FREE_LISBON_VIDEO.mp4';
function VideoCard() {
  return (
    <div className="relative w-full h-screen overflow-hidden ">
      {/* IntroCardComponent overlays the video without padding */}
      <div className="absolute inset-0 z-10 mt-10 ">
        <IntroCardComponent />
      </div>

      {/* Background video */}
      <video className="w-full h-full object-cover " autoPlay loop muted src={localSrc} />
    </div>
  );
}

export default VideoCard;
