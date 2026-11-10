import { PhoneIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Footer = ({ navigation, logo }) => {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        {/* Logo */}
        <div className="site-footer-brand">
          <img src={logo} alt="Lisbon Whisper" />
          <div className="site-footer-brand-copy">
            <strong>Lisbon Whisper</strong>
            <span>Discover Lisbon, one story at a time.</span>
          </div>
        </div>

        <div className="site-footer-column">
          <h2>Contact</h2>
          <div className="site-footer-links">
            <a
              href="mailto:geral@lisbonwhisper.pt"
              className="text-gray-300 hover:text-white transition duration-200 no-underline"
            >
              Email geral@lisbonwhisper.pt
            </a>
            <a
              href="tel:+351965398865"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition duration-200 no-underline"
            >
              <PhoneIcon className="h-4 w-4 text-gray-300" aria-hidden="true" />
              (+351) 965398865
            </a>
            <a
              href="tel:+351969923328"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition duration-200 no-underline"
            >
              <PhoneIcon className="h-4 w-4 text-gray-300" aria-hidden="true" />
              (+351) 969923328
            </a>
          </div>
        </div>

        {/* Navigation */}
        <nav className="site-footer-column" aria-label="Footer navigation">
          <h2>Explore</h2>
          <div className="site-footer-links">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-gray-300 hover:text-white transition duration-200 no-underline"
            >
              {item.name}
            </Link>
          ))}
          </div>
        </nav>
      </div>
      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} Lisbon Whisper. All rights reserved.</span>
        <span>Guide registered at RNAAT · nº 1242/2023</span>
      </div>
    </footer>
  );
};

export default Footer;
