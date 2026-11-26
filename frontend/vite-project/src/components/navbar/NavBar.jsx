import { Disclosure } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import NavigationLinks from './NavigationLinks';
// import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ navigation, logo, compactOnScroll = true }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const isCompact = compactOnScroll && isScrolled;

  useEffect(() => {
    if (!compactOnScroll) return;
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [compactOnScroll]);

  return (
    <Disclosure
      as="nav"
      className={`site-navbar ${isCompact ? 'site-navbar-scrolled' : ''} z-50 fixed top-0 left-0 right-0 w-full`}
    >
      {({ open, close }) => (
        <>
          <div
            className={`mx-auto max-w-8xl px-6 sm:px-6 lg:px-8 transition-all duration-300 ${
              isCompact ? 'py-1' : 'py-1'
            }`}
          >
            <div
              className={`relative flex items-center justify-between transition-all duration-300 ${
                isCompact ? 'h-16' : 'h-20'
              }`}
            >
              {/* Mobile Menu */}
              <MobileMenu />

              {/* Logo and Navigation */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex items-center space-x-4 gap-5">
                  {/* Clickable logo */}
                  <Link to="/" onClick={open ? close : undefined} className="text-inherit no-underline hover:no-underline">
                    <Logo logo={logo} />
                  </Link>

                  <NavigationLinks navigation={navigation} />
                </div>
              </div>

              <div className="flex shrink-0 items-center">
                <Link
                  to="/walking-tours#choose-a-tour"
                  onClick={open ? close : undefined}
                  className="site-nav-cta inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-wide no-underline sm:gap-2 sm:px-5"
                >
                  Book Now
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Profile Dropdown (disabled for now)
              <div>
                <ProfileDropdown />
              </div> */}
            </div>
          </div>

          {/* Disclosure Panel for Mobile Menu */}
          <Disclosure.Panel className="sm:hidden">
            <NavigationLinks navigation={navigation} mobile onNavigate={close} />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
