import React from 'react';
import { PhoneIcon } from '@heroicons/react/24/outline';
import Logo from '../navbar/Logo';

const Footer = ({ navigation, logo }) => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <Logo logo={logo} />
          <span className="text-xs text-gray-400">
            Guide registered at RNAAT with nº1242/2023
          </span>
          <div className="flex flex-col text-sm text-gray-300">
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
