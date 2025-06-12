import React, { useState, useEffect } from 'react';

export default function CardComp({
  title,
  descriptions,
  videoSrc,
  backgroundImage,
  handleShowMoreWithParams,
}) {
  const [descriptionIndex, setDescriptionIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFadingOut(true); // Start fade-out animation

      setTimeout(() => {
        setDescriptionIndex((prevIndex) => (prevIndex + 1) % descriptions.length);
        setIsFadingOut(false); // Reset to fade-in state
      }, 2000); // Match fade-out duration
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [descriptions.length]);

  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32 flex flex-col md:flex-row">
      <img
        alt=""
        src={backgroundImage}
        className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center"
      />
      <div className="flex-1 p-6 lg:p-8">
        <h2 className="text-6xl text-outline font-extrabold tracking-tight text-gray sm:text-6xl mt-8 text-center">
          {title}
        </h2>
        <div className="mx-auto mt-5  text-center">
          <div
            className={` pb-4    tracking-wide ${isFadingOut ? 'fade-out-left' : 'fade-in-right'}`}
          >
            <h4 className="text-3xl description-outline ">{descriptions[descriptionIndex]}</h4>
          </div>
          {/* Use passed navigation logic */}
          <button
            onClick={() => handleShowMoreWithParams(title, descriptions, videoSrc)}
            className="
                            bg-gradient-to-b from-gray-100 to-gray-300 
                            text-gray-800 font-semibold 
                            px-8 py-2
                            rounded-xl 
                            shadow-lg 
                            border border-gray-400 
                            hover:from-gray-200 hover:to-gray-200 
                            hover:shadow-xl 
                            active:scale-95 
                            transition duration-300 ease-in-out"
          >
            Show More
          </button>
        </div>
      </div>
      {/* Video section with styling */}
      <div className="PrincipalAtraticionsShower flex-1">
        <video autoPlay loop muted playsInline preload="auto">
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
