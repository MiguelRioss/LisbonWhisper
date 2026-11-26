import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './App.css';

import Navbar from './components/navbar/NavBar';
import Footer from './components/footer/footer';
import ScrollToTop from './ScrollTop';
import TourPage from './pages/tourPage/tourPage';

import logo from './res/logo.png';

import Home from './pages/Home';
import WalkingTours from './pages/WalkingTours';
import PrivateTours from './pages/PrivateTours';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import DatabaseHome from './pages/DatabaseHome';
import BookingSuccess from './pages/BookingSuccess';
import BookingError from './pages/BookingError';

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

  return (
    <>
      {!isDatabaseRoute && <Navbar navigation={navigation} logo={logo} />}
      <ScrollToTop />
      <main className="page-transition" key={location.pathname}>
      <Routes>
        <Route path="/" element={<Home />} />
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
        <Route path="/tour/:tourId" element={<TourPage />} />
      </Routes>
      </main>
      {!isDatabaseRoute && <Footer navigation={navigation} logo={logo} />}
    </>
  );
}

export default App;
