import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { getGoals } from '../services';
import { ApiError } from '../services/api';
import './Goals.css';

function getErrorMessage(error) {
  return error instanceof ApiError ? error.detail : 'Failed to load your goals.';
}

function formatDate(dateString) {
  if (typeof dateString !== 'string' || !dateString) return '';
  const date = new Date(`${dateString.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getProgress(goal) {
  if (goal.progress === null || goal.progress === undefined) return null;
  const progress = Number(goal.progress);
  return Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : null;
}

export default function Goals() {
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getGoals()
      .then((result) => {
        if (!cancelled) setGoals(result);
      })
      .catch((loadError) => {
        if (!cancelled) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const goalList = goals || [];
  const statuses = [...new Set(
    goalList
      .map((goal) => goal.status)
      .filter((status) => typeof status === 'string' && status.trim())
  )];
  const activeFilter = statuses.includes(statusFilter) ? statusFilter : '';
  const visibleGoals = activeFilter
    ? goalList.filter((goal) => goal.status === activeFilter)
    : goalList;

  return (
    <div className="goals-page">
      <div className="goals-container">
        <header className="goals-heading">
          <div>
            <p className="goals-eyebrow">LEARNING PLAN</p>
            <h1>My Goals</h1>
            <p className="goals-description">
              Track your learning objectives and the progress behind each one.
            </p>
          </div>
          <Link className="goals-create-button" to="/goals/new">
            <Plus size={16} aria-hidden="true" />
            Create Goal
          </Link>
        </header>

        {error && (
          <div className="goals-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
              Try again
            </button>
          </div>
        )}

        {loading && !goals ? (
          <p className="goals-state" role="status">Loading your goals…</p>
        ) : !error && goalList.length === 0 ? (
          <section className="goals-empty">
            <h2>No goals yet</h2>
            <p>Create a learning goal to start tracking your progress.</p>
            <Link className="goals-create-button" to="/goals/new">
              <Plus size={16} aria-hidden="true" />
              Create your first goal
            </Link>
          </section>
        ) : goals ? (
          <>
            <div className="goals-toolbar">
              <p className="goals-count">
                {goalList.length} {goalList.length === 1 ? 'goal' : 'goals'}
              </p>
              {statuses.length > 0 && (
                <div className="goals-filters" role="group" aria-label="Filter goals by status">
                  <button
                    type="button"
                    className="goals-filter"
                    data-active={!activeFilter}
                    aria-pressed={!activeFilter}
                    onClick={() => setStatusFilter('')}
                  >
                    All
                  </button>
                  {statuses.map((status) => (
                    <button
                      type="button"
                      className="goals-filter"
                      data-active={activeFilter === status}
                      aria-pressed={activeFilter === status}
                      key={status}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {visibleGoals.length > 0 ? (
              <ul className="goals-list">
                {visibleGoals.map((goal) => {
                  const progress = getProgress(goal);
                  const targetDate = formatDate(goal.target_date);

                  return (
                    <li className="goals-list-item" key={goal.id}>
                      <article className="goals-item">
                        <div className="goals-item-main">
                          <h2>
                            <Link to={`/goals/${goal.id}`}>{goal.title}</Link>
                          </h2>
                          {goal.description && <p>{goal.description}</p>}
                        </div>

                        <div className="goals-item-meta">
                          {goal.status && (
                            <span className="goals-status">{goal.status}</span>
                          )}
                          {targetDate && (
                            <time dateTime={goal.target_date}>Target {targetDate}</time>
                          )}
                        </div>

                        {progress !== null && (
                          <div className="goals-item-progress">
                            <div className="goals-progress-label">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div
                              className="goals-progress-track"
                              role="progressbar"
                              aria-label={`${goal.title} progress`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={progress}
                            >
                              <span style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        )}

                        <Link
                          className="goals-details-link"
                          to={`/goals/${goal.id}`}
                          aria-label={`View details for ${goal.title}`}
                        >
                          View details
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </article>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="goals-filter-empty">
                <p>No goals match this status.</p>
                <button type="button" onClick={() => setStatusFilter('')}>
                  Clear filter
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
