import { LayoutDashboard, Target, Clock, LogOut, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getNavigationState(pathname, hash) {
  const onDashboard = pathname === '/dashboard';

  return {
    overview: onDashboard && !hash,
    goals: pathname === '/goals' || (onDashboard && hash === '#my-goals'),
    sessions: onDashboard && hash === '#learning-sessions',
  };
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const active = getNavigationState(location.pathname, location.hash);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
    onClose();
  }

  function getLinkClass(isActive) {
    return `app-sidebar-link${isActive ? ' app-sidebar-link--active' : ''}`;
  }

  return (
    <aside
      className={`app-sidebar${isOpen ? ' app-sidebar--open' : ''}`}
      id="app-sidebar"
      aria-label="Primary navigation"
    >
      <div className="app-sidebar-top">
        <Link className="app-shell-wordmark" to="/dashboard" onClick={onClose}>
          ai-learning-tracker
        </Link>
        <button
          type="button"
          className="app-sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="app-sidebar-nav" aria-label="Application">
        <Link
          className={getLinkClass(active.overview)}
          to="/dashboard"
          onClick={onClose}
          aria-current={active.overview ? 'page' : undefined}
        >
          <LayoutDashboard size={17} aria-hidden="true" />
          <span>Overview</span>
        </Link>
        <Link
          className={getLinkClass(active.goals)}
          to="/goals"
          onClick={onClose}
          aria-current={active.goals ? 'page' : undefined}
        >
          <Target size={17} aria-hidden="true" />
          <span>My Goals</span>
        </Link>
        <Link
          className={getLinkClass(active.sessions)}
          to="/dashboard#learning-sessions"
          onClick={onClose}
          aria-current={active.sessions ? 'location' : undefined}
        >
          <Clock size={17} aria-hidden="true" />
          <span>Learning Sessions</span>
        </Link>
      </nav>

      <div className="app-sidebar-account">
        <div className="app-sidebar-user">
          <span className="app-sidebar-user-label">Signed in as</span>
          <span className="app-sidebar-username" title={user?.username}>
            {user?.username}
          </span>
        </div>
        <button className="app-sidebar-logout" type="button" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
