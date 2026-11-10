import { DisclosureButton } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function MobileMenu() {
  return (
    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
      {/* Mobile menu button */}
      <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-slate-800 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-700">
        <span className="absolute -inset-0.5" />
        <span className="sr-only">Open main menu</span>
        <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
        <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
      </DisclosureButton>
    </div>
  );
}
