import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar/NavBar';
import './output.css';

import logo from './res/logo.png';
import VideoCard from './components/backGroundVideo/videoCardContainer';
import Footer from './components/footer/footer';
import Carrousel from './components/tourCardCarrousell/Carrousell';
import TourPage from './components/tourPage/tourPage';
import GenericCarrousel from './components/GenericCarrousel';
import ScrollToTop from './ScrollTop';

const videoSrc = '/src/res/Free_videoLisbon_AI_GENERATED.mp4';
const videoSrcDownTown = '/src/res/LisbonDownTown.mp4';

const cardData = [
    {
        title: "Miradouro's Walking Tour",
        descriptions: [
            "Begin your journey at the historic Lavra Ascensor, one of Lisbon's oldest funiculars...",
            "Savor traditional Portuguese cuisine at a local eatery nearby...",
            "End your tour at Graça Miradouro, one of Lisbon’s most scenic viewpoints..."
        ],
        videoSrc: videoSrc,
        backgroundImage: './src/res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg',
    },
    {
        title: "Downtown Walking Tour",
        descriptions: [
            "Start in the heart of Lisbon at Praça do Comércio...",
            "Discover Lisbon's history in Alfama, the city's oldest neighborhood...",
            "Wrap up at Rossio Square, a lively spot for locals and visitors..."
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
    
    return (
        <Router>
            <div className="relative z-50">
                <Navbar navigation={navigation} logo={logo} />
            </div>
            <ScrollToTop/> {/* This will ensure scroll resets on each route change */}

            <Routes>
                {/* Main Page */}
                <Route
                    path="/"
                    element={
                        <>
                            <VideoCard />
                            <Carrousel cardData={cardData} />
                            
                        </>
                    }
                />

                {/* Route for Tour Detail Page */}
                <Route path="/tour/:tourId" element={
                    <>
                    <TourPage />
                    </>} />
            </Routes>

            <Footer navigation={navigation} logo={logo} />
        </Router>
    );
}

export default App;
