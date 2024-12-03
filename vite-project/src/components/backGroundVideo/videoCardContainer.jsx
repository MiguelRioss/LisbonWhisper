import IntroCardComponent from "../../../../possibleGarbage/IntroCardComponent";
const src = "https://www.youtube.com/watch?v=5DD5lNwc7ho"
const localSrc = "./src/res/FREE_LISBON_VIDEO3.mp4"
function VideoCard() {
  return (
    <div className="relative w-full h-screen overflow-hidden border border-red-500">
      {/* IntroCardComponent overlays the video without padding */}
      <div className="absolute inset-0 z-10 mt-10 ">
        <IntroCardComponent />
      </div>

      {/* Background video */}
      <video
        className="w-full h-full object-cover border border-green-500"
        autoPlay
        loop
        muted
        src={localSrc}
      />
    </div>
  );
}

export default VideoCard;
