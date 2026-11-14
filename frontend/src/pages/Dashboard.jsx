import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import {
  getDailyAnalytics,
  getGoalAnalytics,
  getGoals,
  getLearningCalendar,
  getRoadmap,
  getStreakAnalytics,
} from '../services';
import { ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SessionTracker from '../components/SessionTracker';
import './Dashboard.css';

function getErrorMessage(error, fallback) {
  return error instanceof ApiError ? error.detail : fallback;
}

function formatDuration(seconds) {
  const totalMinutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTodayInIndia() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function buildActivityDays(calendar) {
  const today = new Date(`${getTodayInIndia()}T00:00:00Z`);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setUTCDate(today.getUTCDate() - mondayOffset);
  const start = new Date(currentWeekMonday);
  start.setUTCDate(currentWeekMonday.getUTCDate() - 84);

  const activityByDate = new Map(
    calendar.map((entry) => [entry.date, Number(entry.study_seconds) || 0])
  );
  const days = [];

  for (const date = new Date(start); date <= today; date.setUTCDate(date.getUTCDate() + 1)) {
    const dateKey = date.toISOString().slice(0, 10);
    days.push({
      date: dateKey,
      seconds: activityByDate.get(dateKey) || 0,
    });
  }

  return days;
}

function getActivityLevel(seconds) {
  if (seconds <= 0) return 0;
  if (seconds < 1800) return 1;
  if (seconds < 3600) return 2;
  if (seconds < 7200) return 3;
  return 4;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [data, setData] = useState({
    goals: null,
    goalAnalytics: null,
    streaks: null,
    daily: null,
    calendar: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapError, setRoadmapError] = useState('');
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const sources = [
        ['goals', getGoals, 'Failed to load goals.'],
        ['goalAnalytics', getGoalAnalytics, 'Failed to load goal analytics.'],
        ['streaks', getStreakAnalytics, 'Failed to load streak data.'],
        ['daily', getDailyAnalytics, "Failed to load today's learning data."],
        ['calendar', getLearningCalendar, 'Failed to load learning activity.'],
      ];
      const results = await Promise.allSettled(sources.map(([, load]) => load()));
      const loadedData = {};
      const loadErrors = {};

      results.forEach((result, index) => {
        const [key, , fallback] = sources[index];
        if (result.status === 'fulfilled') {
          loadedData[key] = result.value;
        } else {
          loadErrors[key] = getErrorMessage(result.reason, fallback);
        }
      });

      if (cancelled) return;
      setData((currentData) => ({ ...currentData, ...loadedData }));
      setErrors(loadErrors);
      setLoading(false);
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || !location.hash) return;
    const targetId = decodeURIComponent(location.hash.slice(1));
    document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
  }, [loading, location.hash]);

  const goals = data.goals || [];
  const activeSession = data.daily?.active_session;
  const continueGoal =
    goals.find((goal) => goal.id === activeSession?.goal_id) ||
    goals.find((goal) => goal.status === 'active' && Number(goal.progress) < 100) ||
    goals.find((goal) => Number(goal.progress) < 100) ||
    null;
  const continueGoalId = continueGoal?.id ?? null;

  useEffect(() => {
    if (continueGoalId === null) {
      setRoadmap(null);
      setRoadmapError('');
      setRoadmapLoading(false);
      return undefined;
    }

    let cancelled = false;
    setRoadmap(null);
    setRoadmapError('');
    setRoadmapLoading(true);

    getRoadmap(continueGoalId)
      .then((result) => {
        if (!cancelled) setRoadmap(result);
      })
      .catch((error) => {
        if (!cancelled) {
          setRoadmapError(getErrorMessage(error, 'Could not load the current roadmap.'));
        }
      })
      .finally(() => {
        if (!cancelled) setRoadmapLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [continueGoalId]);

  const orderedPhases = [...(roadmap?.phases || [])].sort(
    (first, second) => first.phase_order - second.phase_order
  );
  const nextStep = orderedPhases
    .flatMap((phase) =>
      (phase.subtasks || []).map((subtask) => ({ phase, subtask }))
    )
    .find(({ subtask }) => !subtask.completed);

  const goalAnalytics = data.goalAnalytics || [];
  const totalStudySeconds = goalAnalytics.reduce(
    (total, goal) => total + (Number(goal.total_study_seconds) || 0),
    0
  );
  const completedSessions = goalAnalytics.reduce(
    (total, goal) => total + (Number(goal.total_sessions) || 0),
    0
  );
  const averageGoalProgress = goals.length
    ? Math.round(
        goals.reduce((total, goal) => total + (Number(goal.progress) || 0), 0) /
          goals.length
      )
    : null;
  const goalAnalyticsById = new Map(goalAnalytics.map((goal) => [goal.goal_id, goal]));
  const activityDays = data.calendar ? buildActivityDays(data.calendar) : [];
  const todayKey = getTodayInIndia();

  const continueHref = activeSession
    ? '/dashboard#learning-sessions'
    : continueGoal
    ? `/goals/${continueGoal.id}`
    : '/goals/new';

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-intro" aria-labelledby="dashboard-title">
          <div>
            <p className="dashboard-eyebrow">LEARNING DASHBOARD</p>
            <h1 className="dashboard-title" id="dashboard-title">
              {getGreeting()}, {user?.username}
            </h1>
            <p className="dashboard-subtitle">
              Your learning progress, goals, and recent work.
            </p>
          </div>
          <Link className="dashboard-primary-action" to="/dashboard#my-goals">
            <ArrowRight size={16} aria-hidden="true" />
            View goals
          </Link>
        </section>

        <section className="dashboard-section" aria-labelledby="overview-title">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">OVERVIEW</p>
              <h2 id="overview-title">Learning overview</h2>
            </div>
          </div>
          <dl className="dashboard-metrics">
            <div className="dashboard-metric">
              <dt>Total learning time</dt>
              <dd>{data.goalAnalytics ? formatDuration(totalStudySeconds) : '—'}</dd>
              <span>
                {data.daily
                  ? `${formatDuration(data.daily.total_study_seconds)} today`
                  : errors.daily || 'Recorded session time'}
              </span>
            </div>
            <div className="dashboard-metric">
              <dt>Current streak</dt>
              <dd>{data.streaks ? `${data.streaks.current_streak} days` : '—'}</dd>
              <span>
                {data.streaks
                  ? `${data.streaks.longest_streak} days longest`
                  : errors.streaks || 'Consecutive learning days'}
              </span>
            </div>
            <div className="dashboard-metric">
              <dt>Completed sessions</dt>
              <dd>{data.goalAnalytics ? completedSessions : '—'}</dd>
              <span>
                {data.goalAnalytics
                  ? `All-time · ${
                      data.daily ? `${data.daily.completed_sessions} today` : 'Across all goals'
                    }`
                  : errors.goalAnalytics || 'Across all learning goals'}
              </span>
            </div>
            <div className="dashboard-metric">
              <dt>Goal progress</dt>
              <dd>{averageGoalProgress === null ? '—' : `${averageGoalProgress}%`}</dd>
              <span>
                {data.goals
                  ? `${goals.length} ${goals.length === 1 ? 'goal' : 'goals'} tracked`
                  : errors.goals || 'Average across your goals'}
              </span>
            </div>
          </dl>
        </section>

        <section className="dashboard-section" aria-labelledby="continue-title">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">NEXT STEP</p>
              <h2 id="continue-title">Continue learning</h2>
            </div>
          </div>

          {loading && !data.goals ? (
            <p className="dashboard-status" role="status">Loading your learning path…</p>
          ) : errors.goals && !data.goals ? (
            <p className="dashboard-error" role="alert">{errors.goals}</p>
          ) : continueGoal ? (
            <div className="dashboard-continue-row">
              <div className="dashboard-continue-copy">
                <p className="dashboard-continue-status">
                  {activeSession ? 'ACTIVE SESSION' : 'ACTIVE GOAL'}
                </p>
                <h3>{continueGoal.title}</h3>
                {roadmapLoading ? (
                  <p className="dashboard-status" role="status">Loading roadmap details…</p>
                ) : roadmapError ? (
                  <p className="dashboard-error" role="alert">{roadmapError}</p>
                ) : nextStep ? (
                  <p className="dashboard-next-step">
                    <span>{nextStep.phase.phase_title}</span>
                    <span>{nextStep.subtask.title}</span>
                  </p>
                ) : roadmap?.phases?.length ? (
                  <p className="dashboard-next-step">All roadmap subtasks are complete.</p>
                ) : (
                  <p className="dashboard-next-step">No roadmap has been generated yet.</p>
                )}
              </div>
              <Link className="dashboard-text-link" to={continueHref}>
                {activeSession ? 'Return to active session' : 'Continue goal'}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="dashboard-continue-row">
              <div className="dashboard-continue-copy">
                <h3>{goals.length ? 'No active goal to continue' : 'No learning goals yet'}</h3>
                <p className="dashboard-next-step">
                  {goals.length
                    ? 'Your goals are complete. Review their roadmaps or start another goal.'
                    : 'Create a goal to start a learning path.'}
                </p>
              </div>
              <Link
                className="dashboard-text-link"
                to={goals.length ? '/dashboard#my-goals' : '/goals/new'}
              >
                {goals.length ? 'View goals' : 'Create a goal'}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        {data.goals && <SessionTracker goals={goals} />}

        <section className="dashboard-section" id="my-goals" aria-labelledby="goals-title">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">ROADMAPS</p>
              <h2 id="goals-title">Goal progress</h2>
            </div>
            <Link className="dashboard-text-link" to="/goals/new">
              New goal
              <Plus size={15} aria-hidden="true" />
            </Link>
          </div>

          {loading && !data.goals ? (
            <p className="dashboard-status" role="status">Loading goals…</p>
          ) : errors.goals && !data.goals ? (
            <p className="dashboard-error" role="alert">{errors.goals}</p>
          ) : goals.length === 0 ? (
            <p className="dashboard-empty">No goals yet. Create one to begin tracking your progress.</p>
          ) : (
            <div className="dashboard-goal-list">
              {goals.map((goal) => {
                const progress = Math.max(0, Math.min(100, Number(goal.progress) || 0));
                const analytics = goalAnalyticsById.get(goal.id);

                return (
                  <article className="dashboard-goal-row" key={goal.id}>
                    <div className="dashboard-goal-copy">
                      <div className="dashboard-goal-meta">
                        <span>{goal.status}</span>
                        {goal.target_date && <span>Due {formatDate(goal.target_date)}</span>}
                      </div>
                      <h3>
                        <Link to={`/goals/${goal.id}`}>{goal.title}</Link>
                      </h3>
                      {goal.description && <p>{goal.description}</p>}
                    </div>
                    <div className="dashboard-goal-progress">
                      <div className="dashboard-progress-label">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div
                        className="dashboard-progress-track"
                        role="progressbar"
                        aria-label={`${goal.title} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                      >
                        <span style={{ width: `${progress}%` }} />
                      </div>
                      <p>
                        {analytics
                          ? `${formatDuration(analytics.total_study_seconds)} studied · ${analytics.total_sessions} sessions`
                          : errors.goalAnalytics || 'Study totals unavailable'}
                      </p>
                    </div>
                    <Link
                      className="dashboard-goal-open"
                      to={`/goals/${goal.id}`}
                      aria-label={`Open ${goal.title}`}
                    >
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-section dashboard-activity" aria-labelledby="activity-title">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">DAILY RECORD</p>
              <h2 id="activity-title">Learning activity</h2>
            </div>
            <span className="dashboard-activity-range">LAST 13 WEEKS</span>
          </div>

          {loading && !data.calendar ? (
            <p className="dashboard-status" role="status">Loading activity…</p>
          ) : errors.calendar && !data.calendar ? (
            <p className="dashboard-error" role="alert">{errors.calendar}</p>
          ) : !data.calendar?.length ? (
            <p className="dashboard-empty">No learning activity has been recorded yet.</p>
          ) : (
            <>
              <div
                className="dashboard-activity-grid"
                role="img"
                aria-label="Daily learning activity during the last 13 weeks"
              >
                {activityDays.map(({ date, seconds }) => {
                  const level = getActivityLevel(seconds);
                  const hasActivity = seconds > 0;
                  const label = hasActivity
                    ? `${formatDate(date)}: ${formatDuration(seconds)} studied`
                    : `${formatDate(date)}: no recorded study time`;

                  return (
                    <span
                      className="dashboard-activity-cell"
                      data-level={level}
                      data-today={date === todayKey && hasActivity ? 'true' : undefined}
                      key={date}
                      title={label}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
              <div className="dashboard-activity-legend" aria-hidden="true">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <span className="dashboard-activity-cell" data-level={level} key={level} />
                ))}
                <span>More</span>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
