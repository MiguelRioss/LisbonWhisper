function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NavigationLinks({ navigation, mobile = false }) {
  return (
    <div className={mobile ? 'space-y-1 px-2 pb-3 pt-2' : 'hidden sm:ml-6 sm:block'}>
      <div className={mobile ? '' : 'flex space-x-4'}>
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            aria-current={item.current ? 'page' : undefined}
            className={classNames(
              item.current
                ? 'bg-slate-200 text-slate-900'
                : 'text-slate-800 hover:bg-slate-200 hover:text-slate-950',
              mobile
                ? 'block rounded-md px-3 py-2 text-base font-medium no-underline'
                : 'rounded-md px-3 py-2 text-sm font-medium no-underline',
              'no-underline' // Add no-underline class here
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';

