// ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top immediately on route change
  }, [pathname]); // Only runs when pathname changes

  return null; // No need to render anything
};

export default ScrollToTop;
