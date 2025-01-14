import React from 'react';
import Logo from '../navbar/Logo';

const Footer = ({ navigation, logo }) => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">

                    <div className="mb-4 md:mb-0">
                        <Logo logo={logo} />
                    </div>
                    
                    <div className="mb-4 md:mb-0">
                        <p className="text-gray-300 text-sm">© 2024 Lisbon Whisper. All rights reserved.</p>
                    </div>

                    <div className="flex space-x-4">
                        {navigation.map((item) => (
                            <a 
                                key={item.name} 
                                href={item.href} 
                                className="no-underline hover:text-gray-400"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
