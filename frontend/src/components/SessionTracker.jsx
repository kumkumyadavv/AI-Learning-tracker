import { useEffect, useState } from 'react';
import { Clock, Loader2, Play, Square } from 'lucide-react';
import { ApiError } from '../services/api';
import { getRoadmap, getSessions, startSession, stopSession } from '../services';
import ErrorMessage from './ErrorMessage';

function formatTime(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function parseTimestamp(timestamp) {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp);
  return new Date(hasTimezone ? timestamp : `${timestamp}Z`);
}

function getErrorMessage(error, fallback) {
  return error instanceof ApiError ? error.detail : fallback;
}

export default function SessionTracker({ goals }) {
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
  const [error, setError] = useState('');
  const [roadmapError, setRoadmapError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        const data = await getSessions();
        if (cancelled) return;

        setSessions(data);
        const active = data.find((session) => !session.ended_at);
        if (active) {
          setActiveSession(active);
          setGoalId(String(active.goal_id));
          setSubtaskId(active.subtask_id == null ? '' : String(active.subtask_id));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError, 'Could not load learning sessions.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!goalId) {
      setSubtasks([]);
      setRoadmapError('');
      return undefined;
    }

    let cancelled = false;
    setRoadmapLoading(true);
    setRoadmapError('');

    getRoadmap(Number(goalId))
      .then((roadmap) => {
        if (cancelled) return;
        setSubtasks((roadmap?.phases || []).flatMap((phase) => phase.subtasks || []));
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
    if (!activeSession) return undefined;

    const updateElapsed = () => {
      const startedAt = parseTimestamp(activeSession.started_at).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeSession]);

  async function handleStart() {
    if (!goalId || saving) return;

    setSaving(true);
    setError('');
    try {
      const session = await startSession(
        Number(goalId),
        subtaskId ? Number(subtaskId) : null
      );
      setActiveSession(session);
      setSessions((previous) => [session, ...previous]);
    } catch (startError) {
      setError(getErrorMessage(startError, 'Could not start the learning session.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleStop() {
    if (!activeSession || saving) return;

    setSaving(true);
    setError('');
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
      setError(getErrorMessage(stopError, 'Could not stop the learning session.'));
    } finally {
      setSaving(false);
    }
  }

  const activeGoal = goals.find((goal) => goal.id === activeSession?.goal_id);
  const recentSessions = sessions.filter((session) => session.ended_at).slice(0, 5);

  return (
    <section className="bg-white border border-paper-200 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-5 w-5 text-accent-600" />
        <h2 className="text-xl font-bold text-ink-900">Learning Session</h2>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      {roadmapError && <div className="mb-4"><ErrorMessage message={roadmapError} /></div>}

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-ink-500" role="status">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading sessions...
        </div>
      ) : activeSession ? (
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Currently learning: <strong>{activeGoal?.title || 'Your learning goal'}</strong>
          </p>
          <p className="text-4xl font-bold text-accent-600 tabular-nums" aria-live="off">
            {formatTime(elapsed)}
          </p>
          <label className="block text-sm font-medium text-ink-700" htmlFor="session-notes">
            Session notes (optional)
          </label>
          <textarea
            id="session-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What did you learn in this session?"
            className="w-full p-3 rounded-lg border border-paper-200"
            rows={3}
          />
          <button
            type="button"
            onClick={handleStop}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
            Stop Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-ink-700" htmlFor="session-goal">
            Learning goal
          </label>
          <select
            id="session-goal"
            value={goalId}
            onChange={(event) => {
              setGoalId(event.target.value);
              setSubtaskId('');
              setSubtasks([]);
            }}
            disabled={saving}
            className="w-full p-3 rounded-lg border border-paper-200"
          >
            <option value="">Select a learning goal</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>

          <label className="block text-sm font-medium text-ink-700" htmlFor="session-subtask">
            Subtask (optional)
          </label>
          <select
            id="session-subtask"
            value={subtaskId}
            onChange={(event) => setSubtaskId(event.target.value)}
            disabled={!goalId || roadmapLoading || saving}
            className="w-full p-3 rounded-lg border border-paper-200 disabled:bg-paper-50"
          >
            <option value="">Whole goal (no specific subtask)</option>
            {subtasks.map((subtask) => (
              <option key={subtask.id} value={subtask.id}>{subtask.title}</option>
            ))}
          </select>
          {roadmapLoading && (
            <p className="text-sm text-ink-500" role="status">Loading subtasks...</p>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={!goalId || saving}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-accent-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Start Learning
          </button>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-paper-100">
        <h3 className="font-semibold text-ink-800 mb-3">Recent Sessions</h3>
        {recentSessions.length > 0 ? (
          <ul className="divide-y divide-paper-100">
            {recentSessions.map((session) => {
              const goal = goals.find((item) => item.id === session.goal_id);
              return (
                <li key={session.id} className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 text-sm">
                  <span className="text-ink-600">
                    {goal?.title || 'Learning goal'} - {parseTimestamp(session.started_at).toLocaleString()}
                  </span>
                  <span className="font-medium text-ink-800">
                    {formatTime(session.duration_seconds || 0)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink-400">No completed sessions yet.</p>
        )}
      </div>
    </section>
  );
}
