import { Disclosure } from '@headlessui/react'
import MobileMenu from './MobileMenu'
import Logo from './Logo'
import NavigationLinks from './NavigationLinks'
import ProfileDropdown from './ProfileDropdown'

export default function Navbar({ navigation, logo }) {
  return (
    <Disclosure as="nav" className="bg-gray-800 z-50">
      <div className="mx-4 max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <MobileMenu />

          {/* Logo and Navigation */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex items-center space-x-4">
              <Logo logo={logo} />
              <NavigationLinks navigation={navigation} />
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="    ">
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {/* Disclosure Panel for Mobile Menu */}
      <Disclosure.Panel className="sm:hidden">
        <NavigationLinks navigation={navigation} mobile />
      </Disclosure.Panel>
    </Disclosure>
  )
}
