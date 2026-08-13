import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Sparkles,
  RefreshCw,
  Map,
} from 'lucide-react';
import { getGoal, getRoadmap, generateRoadmap, updateSubtask } from '../services';
import { ApiError } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import RoadmapView from '../components/RoadmapView';
import GenerateRoadmapModal from '../components/GenerateRoadmapModal';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function GoalDetails() {
  const { goalId } = useParams();
  const id = Number(goalId);

  const [goal, setGoal] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(true);
  const [error, setError] = useState('');
  const [roadmapError, setRoadmapError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [updatingSubtaskId, setUpdatingSubtaskId] = useState(null);

  useEffect(() => {
    if (!id) return;
    getGoal(id)
      .then(setGoal)
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Failed to load goal'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setRoadmapLoading(true);
    getRoadmap(id)
      .then((r) => {
        if (r && r.phases && r.phases.length > 0) setRoadmap(r);
        else setRoadmap(null);
      })
      .catch(() => setRoadmap(null))
      .finally(() => setRoadmapLoading(false));
  }, [id]);

  async function handleGenerate(prefs) {
    setGenError('');
    setGenerating(true);
    try {
      const r = await generateRoadmap(id, prefs);
      setRoadmap(r);
      setModalOpen(false);
      const refreshed = await getGoal(id);
      setGoal(refreshed);
    } catch (err) {
      setGenError(err instanceof ApiError ? err.detail : 'Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleSubtask(subtask) {
    setUpdatingSubtaskId(subtask.id);
    const prev = roadmap;
    setRoadmap((current) => {
      if (!current) return current;
      return {
        ...current,
        phases: current.phases.map((p) => ({
          ...p,
          subtasks: p.subtasks.map((s) =>
            s.id === subtask.id ? { ...s, completed: !s.completed } : s
          ),
        })),
      };
    });
    try {
      const { goal_progress } = await updateSubtask(subtask.id, !subtask.completed);
      setGoal((g) => (g ? { ...g, progress: goal_progress } : g));
    } catch (err) {
      setRoadmap(prev);
      setRoadmapError(err instanceof ApiError ? err.detail : 'Failed to update subtask');
    } finally {
      setUpdatingSubtaskId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-ink-300" />
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-400 hover:text-ink-700 mb-8 transition-colors uppercase tracking-wider-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to goals
        </Link>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-400 hover:text-ink-700 mb-8 transition-colors uppercase tracking-wider-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to goals
      </Link>

      {/* Goal header — editorial workspace */}
      <div className="border-b border-paper-200 pb-8 mb-10">
        <h1 className="text-2xl sm:text-3xl font-serif text-ink-900 leading-tight">{goal?.title}</h1>
        <p className="mt-2 text-sm text-ink-500 leading-relaxed max-w-xl">
          {goal?.description || 'No description'}
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs text-ink-400">
          <Calendar className="h-3.5 w-3.5" />
          <span className="font-mono">Target: {formatDate(goal?.target_date || '')}</span>
        </div>

        {/* Progress */}
        <div className="mt-6 max-w-md">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider-2 text-ink-400">Progress</span>
            <span className="text-2xl font-serif text-ink-900 tabular-nums">{goal?.progress ?? 0}%</span>
          </div>
          <ProgressBar value={goal?.progress ?? 0} size="lg" />
        </div>
      </div>

      {/* Roadmap section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Map className="h-4 w-4 text-ink-400" />
          <h2 className="text-sm font-mono uppercase tracking-wider-2 text-ink-500">Roadmap</h2>
        </div>
        <div className="flex items-center gap-3">
          {roadmap && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-900 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          )}
          <button
            onClick={() => setModalOpen(true)}
            disabled={generating}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 border-b border-accent-600 pb-0.5 hover:text-accent-700 hover:border-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {roadmap ? 'Regenerate Roadmap' : 'Generate Roadmap'}
          </button>
        </div>
      </div>

      {roadmapError && <div className="mb-6"><ErrorMessage message={roadmapError} /></div>}

      {roadmapLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ink-300" />
        </div>
      ) : roadmap ? (
        <RoadmapView
          roadmap={roadmap}
          onToggleSubtask={handleToggleSubtask}
          updatingSubtaskId={updatingSubtaskId}
        />
      ) : (
        <EmptyState
          title="Build your learning path"
          message="Tell us how you learn best, and we'll build a roadmap around your goal."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-600 border-b border-accent-600 pb-1 hover:text-accent-700 hover:border-accent-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Generate Roadmap
            </button>
          }
        />
      )}

      <GenerateRoadmapModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setGenError('');
        }}
        onGenerate={handleGenerate}
        loading={generating}
        error={genError}
      />
    </div>
  );
}
