import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import backgroundImage from '/src/res/backGroundNavbar.png'; // Import your image

function Navbar({ logo }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        <h1>LisbonWhisper</h1>
      </div>

      <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <a onClick={() => handleNavClick('home')} className="nav-button">Inicio</a>
        <Link to="/services">Services</Link>
        <a onClick={() => handleNavClick('info')} className="nav-button">Informações</a>
      </div>

      <button className="navbar-toggle" onClick={toggleNavbar}>
        <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
      </button>
    </nav>
  );
}

export default Navbar;
