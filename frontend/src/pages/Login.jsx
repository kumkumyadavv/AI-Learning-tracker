import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Loader2, Compass, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) setError(err.detail || 'Invalid email or password');
      else setError('Unable to reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-paper-50">
      <div className="fixed right-4 top-4 z-40">
        <ThemeToggle />
      </div>
      {/* Left — editorial brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-ink-900 text-paper-50 relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <Compass className="h-5 w-5 text-accent-400" />
          <span className="text-sm font-semibold tracking-tight">Learning Tracker</span>
        </div>

        <div className="max-w-md">
          <p className="text-xs font-mono uppercase tracking-wider-2 text-ink-300 mb-5">No. 01 — Learn with intent</p>
          <h1 className="text-3xl font-serif leading-tight text-balance">
            Set a goal. Get a roadmap. Track your progress — one subtask at a time.
          </h1>
          <p className="mt-5 text-sm text-ink-400 leading-relaxed">
            A focused learning planner that turns ambitious goals into structured,
            step-by-step roadmaps tailored to how you learn best.
          </p>
        </div>

        <div className="text-xs text-ink-500 font-mono">
          Build skills, not just checklists.
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="inline-flex text-sm font-medium text-ink-500 hover:text-ink-900 mb-8 transition-colors"
          >
            Back to home
          </Link>

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Compass className="h-4 w-4 text-accent-600" />
            <span className="text-sm font-semibold tracking-tight text-ink-900">Learning Tracker</span>
          </div>

          <p className="text-xs font-mono uppercase tracking-wider-2 text-ink-400 mb-2">Sign in</p>
          <h2 className="text-xl font-serif text-ink-900 mb-8">Welcome back.</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink-600 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-ink-200 px-0 py-2 text-sm text-ink-900 placeholder-ink-300 focus:border-accent-600 focus:ring-0 focus:outline-none transition-colors"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink-600 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-ink-200 px-0 py-2 text-sm text-ink-900 placeholder-ink-300 focus:border-accent-600 focus:ring-0 focus:outline-none transition-colors"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink-900 px-4 py-3 text-sm font-semibold text-paper-50 hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-sm text-ink-500 mt-8">
            New here?{' '}
            <Link to="/register" className="font-medium text-accent-600 hover:text-accent-700 underline underline-offset-4 decoration-ink-200 hover:decoration-accent-600 transition-colors">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
