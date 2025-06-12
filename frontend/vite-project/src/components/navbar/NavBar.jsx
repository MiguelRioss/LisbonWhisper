import { Disclosure } from '@headlessui/react';
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import NavigationLinks from './NavigationLinks';
// import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ navigation, logo }) {
  return (
    <Disclosure as="nav" className="bg-gray-800 z-50">
      <div className="mx-4 max-w-8xl px-10 py-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
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
