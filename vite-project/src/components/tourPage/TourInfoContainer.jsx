// TourInfoContainer.js
import React from 'react';

function TourInfoContainer({ tourData }) {
    const { title, descriptions } = tourData; // Destructure state
    const combinedDescriptions = descriptions.reduce((accumulator, currentArray) => {
        return accumulator.concat(currentArray);
    }, []);

    return (
        <div className="bg-black text-white py-10"> {/* Remove fixed height to allow growth */}
            <div className="container mx-auto flex flex-col justify-between"> {/* Flexbox to distribute space */}
                {/* Title Row */}
                <div className="row mb-5 text-center">
                    <div className="col">
                        <h1 className="text-4xl font-bold mb-6 border-b-2 border-white"> {/* Added border below the title */}
                            {title}
                        </h1>
                    </div>
                </div>

                {/* Description and Contact Us Row */}
                <div className="tour-container row mt-5 flex-grow"> {/* Allow this row to grow and fill space */}
                    {/* Description Column */}
                    <div className="description-container col-md-8"> {/* Added right border and padding */}
                        {/* Icons Row */}
                        <div className="icons-container row mb-5">
                            <div className="col text-center border p-4 mx-2"> {/* Added border and padding to each icon */}
                                <i className="bi bi-map-fill" style={{ fontSize: "50px" }}></i>
                                <p className="mt-2">Persons</p>
                            </div>
                            <div className="col text-center border p-4 mx-2"> {/* Added border and padding to each icon */}
                                <i className="bi bi-person-fill" style={{ fontSize: "50px" }}></i>
                                <p className="mt-2">Time</p>
                            </div>
                            <div className="col text-center border p-4 mx-2"> {/* Added border and padding to each icon */}
                                <i className="bi bi-bicycle" style={{ fontSize: "50px" }}></i>
                                <p className="mt-2">Price</p>
                            </div>
                        </div>

                        {/* Use map to dynamically render descriptions */}
                        {combinedDescriptions.map((desc, index) => (
                            <p key={index} className="text-lg mb-4 border-b border-white pb-2"> {/* Added border below paragraph */}
                                {desc}
                            </p>
                        ))}
                    </div>

                    {/* Contact Us Column */}
                    <div className="contactUs-container col-md-4 text-center"> {/* Added left border and padding */}
                        <h2 className="text-2xl font-bold mb-4 border-b border-white"> {/* Added border below the header */}
                            Contact Us
                        </h2>
                        <p>Email: info@lisbontours.com</p>
                        <p>Phone: +123 456 7890</p>
                        <button className="btn btn-primary mt-3">Get in Touch</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TourInfoContainer;
