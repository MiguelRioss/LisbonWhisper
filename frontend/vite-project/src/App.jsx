import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import './output.css';

import Navbar from './components/navbar/NavBar';
import Footer from './components/footer/footer';
import ScrollToTop from './ScrollTop';
import VideoCard from './components/backGroundVideo/videoCardContainer';
import Carrousel from './components/tourCardCarrousell/Carrousell';
import TourPage from './components/tourPage/tourPage';

import logo from './res/logo.png';
import { fetchBookings, createBooking } from './services/bookingService';

import ComingSoon from './pages/ComingSoon';

const videoSrc = '/res/Free_videoLisbon_AI_GENERATED.mp4';
const videoSrcDownTown = '/res/LisbonDownTown.mp4';


const cardData = [
  {
    title: "Miradouro's Walking Tour",
    descriptions: [
      'Begin your journey at the historic Lavra Ascensor...',
      'Savor traditional Portuguese cuisine at a local eatery nearby...',
      'End your tour at Graça Miradouro...',
    ],
    videoSrc: videoSrc,
    backgroundImage: './res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg',
  },
  {
    title: 'Downtown Walking Tour',
    descriptions: [
      'Start in the heart of Lisbon at Praça do Comércio...',
      "Discover Lisbon's history in Alfama...",
      'Wrap up at Rossio Square...',
    ],
    videoSrc: videoSrcDownTown,
    backgroundImage: './res/9bfee964e2a50ec45dc449890ec9ed42.jpg',
  },
];

const navigation = [
  { name: 'Tours', href: '#', current: true },
  { name: 'Contact Us', href: '#', current: false },
];

function App() {
  const [hasAccess, setHasAccess] = useState(
  localStorage.getItem('hasAccess') === 'true'
);

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAvailability = async () => {
    try {
      const data = await fetchBookings();
      setAvailability(data.bookings);
    } catch (err) {
      console.error(err);
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


if (!hasAccess) {
  return <ComingSoon onSuccess={() => {
    localStorage.setItem('hasAccess', 'true');
    setHasAccess(true);
  }} />;
}


  return (
    <>
      <Navbar navigation={navigation} logo={logo} />
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <div className="section-background">
              <VideoCard />
              <Carrousel cardData={cardData} />
            </div>
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
              refetchBookings={fetchAvailability}
            />
          }
        />
      </Routes>
      <Footer navigation={navigation} logo={logo} />
    </>
  );
}

export default App;
