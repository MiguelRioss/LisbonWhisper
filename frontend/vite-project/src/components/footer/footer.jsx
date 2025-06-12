import React from 'react';
import Logo from '../navbar/Logo';

const Footer = ({ navigation, logo }) => {
    return (
<footer className="bg-gray-800 text-white py-6">
  <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
    
    {/* Logo */}
    <div className="flex items-center space-x-2">
      <Logo logo={logo} />
    </div>

    {/* Copyright */}
    <div className="text-sm text-center md:text-left">
      © 2024 Lisbon Whisper. All rights reserved.
    </div>

    {/* Navigation */}
    <div className="flex items-center gap-2 text-base">
  {navigation.map((item) => (
    <a
      key={item.name}
      href={item.href}
      className="text-gray-300 hover:text-white transition duration-200 no-underline"
    >
      {item.name}
    </a>
  ))}
</div>

  </div>
</footer>

    );
};

export default Footer;
