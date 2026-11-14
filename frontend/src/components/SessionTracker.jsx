import { useEffect, useState } from 'react';
import { AlertCircle, Clock, LoaderCircle, Play, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '../services/api';
import { getRoadmap, getSessions, startSession, stopSession } from '../services';
import './SessionTracker.css';

function formatElapsed(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function parseTimestamp(timestamp) {
  if (!timestamp) return new Date(Number.NaN);
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp);
  return new Date(hasTimezone ? timestamp : `${timestamp}Z`);
}

function formatSessionDate(timestamp) {
  const date = parseTimestamp(timestamp);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getErrorMessage(error, fallback) {
  return error instanceof ApiError ? error.detail : fallback;
}

export default function SessionTracker({ goals = [] }) {
  const [goalId, setGoalId] = useState('');
  const [subtaskId, setSubtaskId] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [roadmapError, setRoadmapError] = useState('');
  const [actionError, setActionError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setLoading(true);
      setHistoryError('');

      try {
        const data = await getSessions();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected learning session response.');
        }
        if (cancelled) return;

        setSessions(data);
        const active = data.find((session) => session.ended_at == null) || null;
        setActiveSession(active);
        if (active) {
          setGoalId(String(active.goal_id));
          setSubtaskId(active.subtask_id == null ? '' : String(active.subtask_id));
        }
      } catch (loadError) {
        if (!cancelled) {
          setHistoryError(getErrorMessage(loadError, 'Could not load learning sessions.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSessions();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!goalId) {
      setSubtasks([]);
      setRoadmapError('');
      setRoadmapLoading(false);
      return undefined;
    }

    let cancelled = false;
    setRoadmapLoading(true);
    setRoadmapError('');

    getRoadmap(Number(goalId))
      .then((roadmap) => {
        if (cancelled) return;
        const phases = [...(roadmap?.phases || [])].sort(
          (first, second) => first.phase_order - second.phase_order
        );
        setSubtasks(phases.flatMap((phase) => phase.subtasks || []));
      })
      .catch((roadmapLoadError) => {
        if (!cancelled) {
          setSubtasks([]);
          setRoadmapError(getErrorMessage(roadmapLoadError, 'Could not load subtasks.'));
        }
      })
      .finally(() => {
        if (!cancelled) setRoadmapLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [goalId]);

  useEffect(() => {
    if (!activeSession) {
      setElapsed(0);
      return undefined;
    }

    const updateElapsed = () => {
      const startedAt = parseTimestamp(activeSession.started_at).getTime();
      setElapsed(
        Number.isFinite(startedAt)
          ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
          : 0
      );
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeSession]);

  async function handleStart(event) {
    event.preventDefault();
    setValidationError('');
    setActionError('');

    if (!goalId || !goals.some((goal) => String(goal.id) === goalId)) {
      setValidationError('Select a learning goal before starting a session.');
      return;
    }
    if (loading || historyError || activeSession || saving) return;

    setSaving(true);
    try {
      const session = await startSession(
        Number(goalId),
        subtaskId ? Number(subtaskId) : null
      );
      setActiveSession(session);
      setSessions((previous) => [
        session,
        ...previous.filter((item) => item.id !== session.id),
      ]);
      setGoalId(String(session.goal_id));
      setSubtaskId(session.subtask_id == null ? '' : String(session.subtask_id));
    } catch (startError) {
      setActionError(getErrorMessage(startError, 'Could not start the learning session.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleStop() {
    if (!activeSession || saving) return;

    setSaving(true);
    setActionError('');
    try {
      const stoppedSession = await stopSession(activeSession.id, notes);
      setSessions((previous) =>
        previous.map((session) =>
          session.id === stoppedSession.id ? stoppedSession : session
        )
      );
      setActiveSession(null);
      setNotes('');
      setElapsed(0);
    } catch (stopError) {
      setActionError(getErrorMessage(stopError, 'Could not stop the learning session.'));
    } finally {
      setSaving(false);
    }
  }

  function handleGoalChange(event) {
    setGoalId(event.target.value);
    setSubtaskId('');
    setSubtasks([]);
    setValidationError('');
    setActionError('');
  }

  function handleReload() {
    setActionError('');
    setReloadKey((current) => current + 1);
  }

  const activeGoal = goals.find(
    (goal) => String(goal.id) === String(activeSession?.goal_id)
  );
  const activeSubtask = subtasks.find(
    (subtask) => String(subtask.id) === String(activeSession?.subtask_id)
  );
  const completedSessions = sessions
    .filter((session) => session.ended_at != null)
    .sort(
      (first, second) =>
        parseTimestamp(second.started_at).getTime() -
        parseTimestamp(first.started_at).getTime()
    );
  const canStart = goals.length > 0 && !loading && !historyError && !saving;

  return (
    <section className="sessions-page" id="learning-sessions" aria-labelledby="sessions-title">
      <header className="sessions-page-heading">
        <div>
          <p className="sessions-eyebrow">STUDY TRACKER</p>
          <h2 className="sessions-title" id="sessions-title">Learning Sessions</h2>
          <p className="sessions-subtitle">
            Start a focused session, then review the time you have logged.
          </p>
        </div>
      </header>

      {[
        { key: 'history', message: historyError },
        { key: 'action', message: actionError },
      ].filter(({ message }) => message).map(({ key, message }) => (
        <div className="sessions-alert" role="alert" key={key}>
          <AlertCircle size={16} aria-hidden="true" />
          <span>{message}</span>
          <button type="button" onClick={handleReload}>Reload sessions</button>
        </div>
      ))}

      <div className="sessions-content">
        <section className="sessions-panel sessions-control" aria-labelledby="session-control-title">
          <p className="sessions-eyebrow">
            {activeSession ? 'IN PROGRESS' : 'NEW SESSION'}
          </p>
          <h3 className="sessions-panel-title" id="session-control-title">
            {activeSession ? 'Session in progress' : 'Start a learning session'}
          </h3>

          {loading ? (
            <p className="sessions-status" role="status">
              <LoaderCircle size={15} className="sessions-spinner" aria-hidden="true" />
              Checking for an active session…
            </p>
          ) : activeSession ? (
            <div className="sessions-active">
              <div className="sessions-active-context">
                <span>GOAL</span>
                <p>{activeGoal?.title || 'Goal unavailable'}</p>
                {activeSession.subtask_id != null && (
                  <>
                    <span>SUBTASK</span>
                    <p>{activeSubtask?.title || 'Subtask unavailable'}</p>
                  </>
                )}
                <span>STARTED</span>
                <p>{formatSessionDate(activeSession.started_at)}</p>
              </div>

              <p
                className="sessions-timer"
                role="timer"
                aria-label={`Elapsed time ${formatElapsed(elapsed)}`}
                aria-live="off"
              >
                {formatElapsed(elapsed)}
              </p>

              <label className="sessions-label" htmlFor="session-notes">
                Session notes <span>Optional · saved when you stop</span>
              </label>
              <textarea
                className="sessions-field sessions-notes"
                id="session-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What did you work on?"
                rows={3}
                disabled={saving}
              />
              <button
                className="sessions-button sessions-stop-button"
                type="button"
                onClick={handleStop}
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle size={16} className="sessions-spinner" aria-hidden="true" />
                ) : (
                  <Square size={14} aria-hidden="true" />
                )}
                Stop session
              </button>
            </div>
          ) : goals.length === 0 ? (
            <div className="sessions-empty-goals">
              <p>Create a learning goal before starting a session.</p>
              <Link className="sessions-text-link" to="/goals/new">Create a goal</Link>
            </div>
          ) : (
            <form className="sessions-form" onSubmit={handleStart} noValidate>
              <div className="sessions-field-group">
                <label className="sessions-label" htmlFor="session-goal">Learning goal</label>
                <select
                  className="sessions-field"
                  id="session-goal"
                  value={goalId}
                  onChange={handleGoalChange}
                  disabled={saving || Boolean(historyError)}
                  aria-invalid={Boolean(validationError && !goalId)}
                  aria-describedby={validationError && !goalId ? 'session-goal-error' : undefined}
                >
                  <option value="">Select a goal</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
                {validationError && !goalId && (
                  <span className="sessions-field-error" id="session-goal-error">
                    {validationError}
                  </span>
                )}
              </div>

              <div className="sessions-field-group">
                <label className="sessions-label" htmlFor="session-subtask">
                  Subtask <span>Optional</span>
                </label>
                <select
                  className="sessions-field"
                  id="session-subtask"
                  value={subtaskId}
                  onChange={(event) => setSubtaskId(event.target.value)}
                  disabled={!goalId || roadmapLoading || saving || Boolean(historyError)}
                >
                  <option value="">Entire goal</option>
                  {subtasks.map((subtask) => (
                    <option key={subtask.id} value={subtask.id}>
                      {subtask.title}{subtask.completed ? ' · Completed' : ''}
                    </option>
                  ))}
                </select>
                {roadmapLoading && (
                  <span className="sessions-field-hint" role="status">Loading goal subtasks…</span>
                )}
                {roadmapError && (
                  <span className="sessions-field-error" role="alert">{roadmapError}</span>
                )}
              </div>

              <button className="sessions-button sessions-start-button" type="submit" disabled={!canStart}>
                {saving ? (
                  <LoaderCircle size={16} className="sessions-spinner" aria-hidden="true" />
                ) : (
                  <Play size={15} aria-hidden="true" />
                )}
                Start session
              </button>
            </form>
          )}
        </section>

        <section className="sessions-panel sessions-history" aria-labelledby="session-history-title">
          <div className="sessions-history-heading">
            <div>
              <p className="sessions-eyebrow">YOUR LOG</p>
              <h3 className="sessions-panel-title" id="session-history-title">Session history</h3>
            </div>
            <span className="sessions-count">
              {loading ? '—' : `${completedSessions.length} ${completedSessions.length === 1 ? 'SESSION' : 'SESSIONS'}`}
            </span>
          </div>

          {loading ? (
            <p className="sessions-status" role="status">
              <LoaderCircle size={15} className="sessions-spinner" aria-hidden="true" />
              Loading session history…
            </p>
          ) : historyError ? (
            <p className="sessions-empty-message">Session history is unavailable until it can be reloaded.</p>
          ) : completedSessions.length === 0 ? (
            <p className="sessions-empty-message">
              No completed sessions yet. Sessions will appear here after you stop a timer.
            </p>
          ) : (
            <ol className="sessions-history-list">
              {completedSessions.map((session) => {
                const goal = goals.find((item) => String(item.id) === String(session.goal_id));
                return (
                  <li className="sessions-history-entry" key={session.id}>
                    <div className="sessions-entry-copy">
                      <p className="sessions-entry-date">{formatSessionDate(session.started_at)}</p>
                      <h4>{goal?.title || 'Goal unavailable'}</h4>
                      {session.notes && <p className="sessions-entry-notes">{session.notes}</p>}
                    </div>
                    <p className="sessions-entry-duration">
                      <Clock size={14} aria-hidden="true" />
                      <span>{formatElapsed(session.duration_seconds)}</span>
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </section>
  );
}
