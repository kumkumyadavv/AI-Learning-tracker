import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Loader2, Compass, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

export default function Register() {
  const { register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ username, email, password });
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) setError(err.detail || 'Registration failed');
      else setError('Unable to reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-paper-50">
      {/* Left — editorial brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-ink-900 text-paper-50 relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <Compass className="h-5 w-5 text-accent-400" />
          <span className="text-sm font-semibold tracking-tight">Learning Tracker</span>
        </div>

        <div className="max-w-md">
          <p className="text-xs font-mono uppercase tracking-wider-2 text-ink-300 mb-5">No. 02 — Start today</p>
          <h1 className="text-3xl font-serif leading-tight text-balance">
            Every expert was once a beginner who kept showing up.
          </h1>
          <p className="mt-5 text-sm text-ink-400 leading-relaxed">
            Create your account, set your first learning goal, and get a
            personalized roadmap generated around your time, level, and style.
          </p>
        </div>

        <div className="text-xs text-ink-500 font-mono">
          Build skills, not just checklists.
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Compass className="h-4 w-4 text-accent-600" />
            <span className="text-sm font-semibold tracking-tight text-ink-900">Learning Tracker</span>
          </div>

          <p className="text-xs font-mono uppercase tracking-wider-2 text-ink-400 mb-2">Create account</p>
          <h2 className="text-xl font-serif text-ink-900 mb-8">Begin your journey.</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-ink-600 mb-1.5">Username</label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-ink-200 px-0 py-2 text-sm text-ink-900 placeholder-ink-300 focus:border-accent-600 focus:ring-0 focus:outline-none transition-colors"
                placeholder="Your Name"
                autoComplete="username"
              />
            </div>
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
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink-900 px-4 py-3 text-sm font-semibold text-paper-50 hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-sm text-ink-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent-600 hover:text-accent-700 underline underline-offset-4 decoration-ink-200 hover:decoration-accent-600 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
