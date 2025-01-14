import React, { useState, useEffect } from 'react';

export default function CardComp({ title, descriptions, videoSrc, backgroundImage, handleShowMoreWithParams }) {
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
                <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl mt-8 text-center">
                    {title}
                </h2>
                <div className="mx-auto mt-5 max-w-2xl text-center">
                    <div
                        className={`text-lg text-white leading-relaxed tracking-wide ${
                            isFadingOut ? 'fade-out-left' : 'fade-in-right'
                        }`}
                    >
                        <p>{descriptions[descriptionIndex]}</p>
                    </div>
                    {/* Use passed navigation logic */}
                    <button
                        type="button"
                        onClick={() => handleShowMoreWithParams(title, descriptions, videoSrc)}
                        className="btn btn-light"
                    >
                        Show More
                    </button>
                </div>
            </div>
            {/* Video section with styling */}
            <div className="PrincipalAtraticionsShower flex-1">
                <video autoPlay loop muted>
                    <source src={videoSrc} type="video/mp4" />
                </video>
            </div>
        </div>
    );
}
