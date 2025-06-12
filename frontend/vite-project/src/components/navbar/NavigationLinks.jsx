function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NavigationLinks({ navigation, mobile = false }) {
  return (
    <div className={mobile ? 'space-y-1 px-2 pb-3 pt-2' : 'hidden sm:ml-6 sm:block'}>
      <div className={mobile ? '' : 'flex space-x-4'}>
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            aria-current={item.current ? 'page' : undefined}
            className={classNames(
              item.current
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              mobile
                ? 'block rounded-md px-3 py-2 text-base font-medium no-underline'
                : 'rounded-md px-3 py-2 text-sm font-medium no-underline',
              'no-underline' // Add no-underline class here
            )}
          >
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
}
