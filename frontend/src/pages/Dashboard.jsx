import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { getGoals, deleteGoal } from '../services';
import { ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import GoalProgressChart from '../components/GoalProgressChart';

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
    <div className="min-h-screen bg-gradient-to-br from-paper-100 via-paper-50 to-paper-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Page header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-accent-600 font-semibold mb-2">Learning Dashboard</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 leading-tight">
                {getGreeting()}, <span className="text-accent-600">{user?.username}</span>
              </h1>
              <p className="mt-3 text-base text-ink-600">Keep building momentum on your learning journey.</p>
            </div>
            <Link
              to="/goals/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 shrink-0"
            >
              <Plus className="h-5 w-5" />
              New Goal
            </Link>
          </div>
        </div>

      {error && <div className="mb-8"><ErrorMessage message={error} /></div>}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full animate-spin" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
            </div>
            <p className="text-ink-500 font-medium">Loading your goals...</p>
          </div>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <EmptyState
            title="No goals yet"
            message="Create your first learning goal and generate a personalized roadmap to get started."
            action={
              <Link
                to="/goals/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create your first goal
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Progress chart */}
          <GoalProgressChart goals={goals} />

          {/* Goals grid */}
          <div>
            <h2 className="text-2xl font-bold text-ink-900 mb-6">Your Goals</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              to={`/goals/${goal.id}`}
              className="group bg-white border border-paper-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:border-accent-200 hover:scale-105 transform"
            >
              <div className="space-y-5">
                {/* Header */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-ink-900 group-hover:text-accent-600 transition-colors line-clamp-2">
                    {goal.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-600 line-clamp-2">
                    {goal.description || 'No description added yet'}
                  </p>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-ink-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-accent-500" />
                    <span>{formatDate(goal.target_date)}</span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-ink-600">PROGRESS</span>
                    <span className="text-sm font-bold text-accent-600">{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-paper-100">
                  <span className="text-xs text-ink-400">Click to view details</span>
                  <ArrowRight className="h-4 w-4 text-accent-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

