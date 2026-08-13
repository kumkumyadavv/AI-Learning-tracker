import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { getGoals, deleteGoal } from '../services';
import { ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getGoals()
      .then(setGoals)
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Failed to load goals'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(goalId) {
    if (!window.confirm('Delete this goal? This action cannot be undone.')) return;
    setDeletingId(goalId);
    try {
      await deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Failed to delete goal');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      {/* Page header */}
      <div className="mb-12">
        <p className="text-xs font-mono uppercase tracking-wider-2 text-ink-400 mb-3">Dashboard</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-ink-900 leading-tight">
              {getGreeting()}, {user?.username}.
            </h1>
            <p className="mt-2 text-sm text-ink-500">Keep building momentum.</p>
          </div>
          <Link
            to="/goals/new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 border-b border-ink-900 pb-1 hover:border-accent-600 hover:text-accent-600 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Goal
          </Link>
        </div>
      </div>

      {error && <div className="mb-8"><ErrorMessage message={error} /></div>}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-ink-300" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          message="Create your first learning goal and generate a personalized roadmap to get started."
          action={
            <Link
              to="/goals/new"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-600 border-b border-accent-600 pb-1 hover:text-accent-700 hover:border-accent-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first goal
            </Link>
          }
        />
      ) : (
        <div className="border-t border-paper-200">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="group border-b border-paper-200 py-7 transition-colors hover:bg-paper-100/50"
            >
              <div className="flex items-start justify-between gap-6">
                <Link to={`/goals/${goal.id}`} className="flex-1 min-w-0 block">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-lg font-serif text-ink-900 group-hover:text-accent-700 transition-colors">
                      {goal.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-ink-500 line-clamp-1 max-w-lg">
                    {goal.description || 'No description'}
                  </p>

                  {/* Progress */}
                  <div className="mt-4 max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-ink-400">
                        {goal.progress}% complete
                      </span>
                      <span className="text-xs text-ink-300 font-mono">
                        {formatDate(goal.target_date)}
                      </span>
                    </div>
                    <ProgressBar value={goal.progress} />
                  </div>
                </Link>

                <div className="flex items-center gap-3 shrink-0 pt-1">
                  <Link
                    to={`/goals/${goal.id}`}
                    className="text-ink-300 group-hover:text-accent-600 transition-colors"
                    aria-label="Open goal"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    disabled={deletingId === goal.id}
                    className="text-ink-300 hover:text-red-500 disabled:opacity-50 transition-colors"
                    aria-label="Delete goal"
                  >
                    {deletingId === goal.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
