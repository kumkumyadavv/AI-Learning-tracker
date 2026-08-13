import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { createGoal } from '../services';
import { ApiError } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

export default function CreateGoal() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    try {
      const goal = await createGoal({
        title: title.trim(),
        description: description.trim(),
        target_date: targetDate || '',
      });
      navigate(`/goals/${goal.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-400 hover:text-ink-700 mb-8 transition-colors uppercase tracking-wider-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to goals
      </Link>

      <p className="text-xs font-mono uppercase tracking-wider-2 text-ink-400 mb-3">New Goal</p>
      <h1 className="text-2xl sm:text-3xl font-serif text-ink-900 leading-tight mb-2">
        What do you want to learn?
      </h1>
      <p className="text-sm text-ink-500 mb-10">
        Define your goal. You can generate a roadmap after creating it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="title" className="block text-xs font-mono uppercase tracking-wider-2 text-ink-400 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-ink-200 px-0 py-2.5 text-lg font-serif text-ink-900 placeholder-ink-300 focus:border-accent-600 focus:ring-0 focus:outline-none transition-colors"
            placeholder="Learn DSA"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-mono uppercase tracking-wider-2 text-ink-400 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-ink-200 px-0 py-2.5 text-sm text-ink-900 placeholder-ink-300 focus:border-accent-600 focus:ring-0 focus:outline-none transition-colors resize-none"
            placeholder="Prepare for coding interviews with a structured approach"
          />
        </div>

        <div>
          <label htmlFor="targetDate" className="block text-xs font-mono uppercase tracking-wider-2 text-ink-400 mb-2">
            Target Date
          </label>
          <input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-transparent border-0 border-b border-ink-200 px-0 py-2.5 text-sm text-ink-900 focus:border-accent-600 focus:ring-0 focus:outline-none transition-colors"
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-ink-900 px-6 py-3 text-sm font-semibold text-paper-50 hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Goal <ArrowRight className="h-4 w-4" /></>}
          </button>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
