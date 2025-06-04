// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './output.css';

import Navbar from './components/navbar/NavBar';
import Footer from './components/footer/footer';
import ScrollToTop from './ScrollTop';
import VideoCard from './components/backGroundVideo/videoCardContainer';
import Carrousel from './components/tourCardCarrousell/Carrousell';
import TourPage from './components/tourPage/tourPage';

import logo from './res/logo.png';


import { fetchBookings,createBooking } from './services/bookingService';


const videoSrc = '/src/res/Free_videoLisbon_AI_GENERATED.mp4';
const videoSrcDownTown = '/src/res/LisbonDownTown.mp4';

const cardData = [
  {
    title: "Miradouro's Walking Tour",
    descriptions: [
      "Begin your journey at the historic Lavra Ascensor...",
      "Savor traditional Portuguese cuisine at a local eatery nearby...",
      "End your tour at Graça Miradouro..."
    ],
    videoSrc: videoSrc,
    backgroundImage: './src/res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg',
  },
  {
    title: "Downtown Walking Tour",
    descriptions: [
      "Start in the heart of Lisbon at Praça do Comércio...",
      "Discover Lisbon's history in Alfama...",
      "Wrap up at Rossio Square..."
    ],
    videoSrc: videoSrcDownTown,
    backgroundImage: './src/res/9bfee964e2a50ec45dc449890ec9ed42.jpg',
  }
];

const navigation = [
  { name: 'Tours', href: '#', current: true },
  { name: 'Equipa', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'Calendar', href: '#', current: false },
];

function App() {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchAvailability = async () => {
    try {
      const data = await fetchBookings();
      console.log("Here data:" , data.bookings)
      setAvailability(data.bookings);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to fetch availability data');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAvailability();
    const intervalId = setInterval(fetchAvailability, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router>
      <div className="relative z-50">
        <Navbar navigation={navigation} logo={logo} />
      </div>

      <ScrollToTop />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <VideoCard />
              <Carrousel cardData={cardData} />
            </>
          }
        />

          <Route
            path="/tour/:tourId"
            element={
              <TourPage
                bookings={availability}
                loading={loading}
                error={error}
                createBookingHandler={createBooking}
                refetchBookings={fetchAvailability} // 👈 add this
              />
            }
          />

      </Routes>

      <Footer navigation={navigation} logo={logo} />
    </Router>
  );
}

export default App;
