import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './App.css';

import Navbar from './components/navbar/NavBar';
import Footer from './components/footer/footer';
import ScrollToTop from './ScrollTop';
import VideoCard from './components/backGroundVideo/videoCardContainer';
import Carrousel from './components/tourCardCarrousell/Carrousell';
import TourPage from './pages/tourPage/tourPage';
import Footsteps from './components/Footsteps';

import logo from './res/logo.png';
import { useFetch } from './api/useFetch';
import { bookingsCacheKey, fetchBookings, createBooking } from './services/bookingService';

import WalkingTours from './pages/WalkingTours';
import PrivateTours from './pages/PrivateTours';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import DatabaseHome from './pages/DatabaseHome';
import BookingSuccess from './pages/BookingSuccess';
import BookingError from './pages/BookingError';

const videoSrc = '/res/Free_videoLisbon_AI_GENERATED.mp4';
const videoSrcDownTown = '/res/LisbonDownTown.mp4';

const cardData = [
  {
    title: 'The Moorish Whispers',
    descriptions: [
      "Discover Lisbon's hidden secrets from the Torel viewpoint to Rua Augusta.",
      'A journey that will make us travel back in time through the stories of this mysterious Lisbon.',
      'Through alleys, churches, centuries-old buildings, and lively conversations with locals. The route takes you uphill across six viewpoints and ends in Rua Augusta.',
    ],
    videoSrc: videoSrc,
    backgroundImage: './res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg',
  },
  {
    title: 'The West Whispers',
    descriptions: [
      'This tour takes you to a part of Lisbon marked by its art deco and art noveau palaces.',
      'Starting from Rossio train station, you reach the first of three viewpoints with the best view of Sao Jorge Castle.',
      'Then wander through the Bairro Alto down to a bohemian riverside Lisbon, ending the tour in the pink street.',
    ],
    videoSrc: videoSrcDownTown,
    backgroundImage: './res/9bfee964e2a50ec45dc449890ec9ed42.jpg',
  },
];

const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'About Us', href: '/about-us', current: false },
  { name: 'Walking Tours', href: '/walking-tours', current: false },
  { name: 'Private Tours', href: '/private-tours', current: false },
  { name: 'Contact Us', href: '/contact-us', current: false },
];

function App() {
  const location = useLocation();
  const isDatabaseRoute = location.pathname.startsWith('/database');

  const { status, refetch } = useFetch(isDatabaseRoute ? null : bookingsCacheKey, fetchBookings);
  const result = status.kind === 'success' ? status : status.stale;
  const availability = result?.body.kind === 'json' ? result.body.json?.bookings : undefined;
  const waiting = status.kind === 'idle' || status.kind === 'loading';
  const loading = waiting && !Array.isArray(availability);
  const error = !waiting && (status.kind !== 'success' || !Array.isArray(availability))
    ? 'Failed to fetch availability data'
    : null;

  useEffect(() => {
    if (isDatabaseRoute) return;
    const intervalId = setInterval(refetch, 30000);
    return () => clearInterval(intervalId);
  }, [isDatabaseRoute, refetch]);

  return (
    <>
      {!isDatabaseRoute && <Navbar navigation={navigation} logo={logo} />}
      <ScrollToTop />
      <main className="page-transition" key={location.pathname}>
      <Routes>
        <Route
          path="/"
          element={
            <div className="home-surface">
              <Footsteps />
              <VideoCard />
              <Carrousel cardData={cardData} />
            </div>
          }
        />
        <Route path="/walking-tours" element={<WalkingTours />} />
        <Route path="/private-tours" element={<PrivateTours />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/booking/cancel" element={<BookingError />} />
        <Route path="/booking/error" element={<BookingError />} />
        <Route path="/sorteio" element={<Navigate to="/" replace />} />
        <Route path="/database" element={<DatabaseHome />} />
        <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
        <Route
          path="/tour/:tourId"
          element={
            <TourPage
              tours={cardData}
              bookings={availability}
              loading={loading}
              error={error}
              createBookingHandler={createBooking}
            />
          }
        />
      </Routes>
      </main>
      {!isDatabaseRoute && <Footer navigation={navigation} logo={logo} />}
    </>
  );
}

export default App;
