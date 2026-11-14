import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function getPageTitle(pathname, hash) {
  if (pathname === '/dashboard' && hash === '#my-goals') return 'My Goals';
  if (pathname === '/dashboard' && hash === '#learning-sessions') return 'Learning Sessions';
  if (pathname === '/dashboard') return 'Overview';
  if (pathname === '/goals/new') return 'New Goal';
  if (pathname.startsWith('/goals/')) return 'Goal Details';
  return 'Overview';
}

export default function Navbar({ mobileNavOpen, onMenuClick }) {
  const location = useLocation();
  const title = getPageTitle(location.pathname, location.hash);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          type="button"
          className="app-mobile-menu"
          onClick={onMenuClick}
          aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileNavOpen}
          aria-controls="app-sidebar"
        >
          <Menu size={19} aria-hidden="true" />
        </button>
        <p className="app-header-title" aria-live="polite">{title}</p>
        <ThemeToggle />
      </div>
    </header>
  );
}
