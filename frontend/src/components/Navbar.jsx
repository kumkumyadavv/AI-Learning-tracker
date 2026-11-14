import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-paper-50/95 backdrop-blur-sm border-b border-paper-200">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-ink-900">
          <Compass className="h-4 w-4 text-accent-600" />
          <span className="text-sm font-semibold tracking-tight">Learning Tracker</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs text-ink-500 hidden sm:inline font-mono">{user.username}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-900 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
