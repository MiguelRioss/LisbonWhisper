// TourInfoContainer.js
import React from 'react';
import PersonLogo from '../../res/Persons_Icon.png'; // Adjust the path as necessary
import MoneyLogo from '../../res/Dollar_Icon.png'; // Adjust the path as necessary
import TimeLogo from '../../res/Time_Logo.png'; // Adjust the path as necessary

function TourInfoContainer({ tourData }) {
  const { title, descriptions } = tourData; // Destructure state
  const combinedDescriptions = descriptions.reduce((accumulator, currentArray) => {
    return accumulator.concat(currentArray);
  }, []);

  return (
    <div className="tour-page-background text-white py-10">
      {' '}
      {/* Remove fixed height to allow growth */}
      <div className="container mx-auto flex flex-col justify-between">
        {' '}
        {/* Flexbox to distribute space */}
        {/* Title Row */}
        <div className="row mb-5 text-center">
          <div className="col">
            <h1 className="tour-title">Miradouro's Walking Tour</h1>
          </div>
        </div>
        {/* Description and Contact Us Row */}
        <div className="tour-container row mt-5 flex-grow">
          {' '}
          {/* Allow this row to grow and fill space */}
          {/* Description Column */}
          <div className="description-container p-10 col-md-8">
            {' '}
            {/* Added right border and padding */}
            {/* Icons Row */}
            <div className="icons-container mb-8 text-white flex justify-between gap-8">
              <div className="col flex flex-col items-center justify-center  p-4 mx-2">
                <div className="w-[48px] h-[48px] flex items-center justify-center overflow-hidden mb-2">
                  <img src={PersonLogo} alt="Persons" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm font-medium">Persons</p>
              </div>

              <div className="col flex flex-col items-center justify-center  p-4 mx-2">
                <div className="w-[48px] h-[48px] flex items-center justify-center overflow-hidden mb-2">
                  <img src={TimeLogo} alt="Time" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm font-medium">Time</p>
              </div>

              <div className="col flex flex-col items-center justify-center  p-4 mx-2">
                <div className="w-[58px] h-[58px] flex items-center justify-center overflow-hidden mb-2">
                  <img src={MoneyLogo} alt="Price" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm font-medium">Price</p>
              </div>
            </div>
            {/* Use map to dynamically render descriptions */}
            {combinedDescriptions.map((desc, index) => (
              <p key={index} className="description-text">
                {/* Added border below paragraph */}
                {desc}
              </p>
            ))}
          </div>
          {/* Contact Us Column */}
          <div className="contactUs-container col-md-4 flex justify-center items-center">
            <div className="w-full  max-w-sm  text-white p-8 text-center">
              <h2 className="text-3xl font-bold  mb-10">Contact Us</h2>

              <p>
                Email:{' '}
                <a href="mailto:info@lisbontours.com" className>
                  info@lisbontours.com
                </a>
              </p>

              <p>Phone: +123 456 7890</p>
              <button className="mt-6 px-6 py-2 text-white font-semibold rounded-md p-4 border">
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TourInfoContainer;
