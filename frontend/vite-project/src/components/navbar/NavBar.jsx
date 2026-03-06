import { Disclosure } from '@headlessui/react';
import { useEffect, useState } from 'react';
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import NavigationLinks from './NavigationLinks';
// import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ navigation, logo }) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsCompact(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Disclosure
      as="nav"
      className="bg-gray-800/80 backdrop-blur-md z-50 fixed top-0 left-0 right-0 w-full"
    >
      <div
        className={`mx-auto max-w-8xl px-6 sm:px-6 lg:px-8 transition-all duration-300 ${
          isCompact ? 'py-1' : 'py-2'
        }`}
      >
        <div
          className={`relative flex items-center justify-between transition-all duration-300 ${
            isCompact ? 'h-12' : 'h-16'
          }`}
        >
          {/* Mobile Menu */}
          <MobileMenu />

          {/* Logo and Navigation */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex items-center space-x-4 gap-5">
              {/* Clickable logo */}
              <a href="/" className="text-inherit no-underline hover:no-underline">
                <Logo logo={logo} />
              </a>

              <NavigationLinks navigation={navigation} />
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <a
              href="/walking-tours"
              className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-gray-900 no-underline"
            >
              Explore Our Tours
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Profile Dropdown (disabled for now)
          <div>
            <ProfileDropdown />
          </div> */}
        </div>
      </div>

      {/* Disclosure Panel for Mobile Menu */}
      <Disclosure.Panel className="sm:hidden">
        <NavigationLinks navigation={navigation} mobile />
      </Disclosure.Panel>
    </Disclosure>
  );
}
