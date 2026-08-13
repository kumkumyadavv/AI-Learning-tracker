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
import SubtaskCompletionChart from '../components/SubtaskCompletionChart';
import PhaseProgressChart from '../components/PhaseProgressChart';

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
      <div className="min-h-screen bg-gradient-to-br from-paper-100 via-paper-50 to-paper-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full animate-spin" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
          </div>
          <p className="text-ink-500 font-medium">Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paper-100 via-paper-50 to-paper-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:text-accent-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to goals
          </Link>
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-100 via-paper-50 to-paper-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:text-accent-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to goals
        </Link>

        {/* Goal header — card */}
        <div className="bg-white border border-paper-200 rounded-2xl p-8 mb-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-ink-900 leading-tight mb-3">{goal?.title}</h1>
              <p className="text-base text-ink-600 leading-relaxed max-w-2xl">
                {goal?.description || 'No description added yet'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-ink-500 font-medium">
              <Calendar className="h-5 w-5 text-accent-500" />
              <span>Target deadline: <strong className="text-ink-700">{formatDate(goal?.target_date || '')}</strong></span>
            </div>

            {/* Progress section */}
            <div className="pt-4 border-t border-paper-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold uppercase tracking-wider text-ink-700">Progress</span>
                <span className="text-3xl font-bold text-accent-600">{goal?.progress ?? 0}%</span>
              </div>
              <ProgressBar value={goal?.progress ?? 0} size="lg" />
            </div>
          </div>
        </div>

        {/* Charts section - only show when roadmap is loaded */}
        {roadmap && !roadmapLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <SubtaskCompletionChart roadmap={roadmap} />
            <PhaseProgressChart roadmap={roadmap} />
          </div>
        )}

      {/* Roadmap section */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">Your Learning Roadmap</h2>
            <p className="mt-1 text-ink-600">Follow the phases below to master your goal</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {roadmap && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-accent-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
            )}
            <button
              onClick={() => setModalOpen(true)}
              disabled={generating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              {roadmap ? 'Regenerate Roadmap' : 'Generate Roadmap'}
            </button>
          </div>
        </div>

        {roadmapError && <div className="mb-6"><ErrorMessage message={roadmapError} /></div>}

        {roadmapLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full animate-spin" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
            </div>
            <p className="text-ink-500 font-medium">Loading roadmap...</p>
          </div>
        </div>
      ) : roadmap ? (
        <RoadmapView
          roadmap={roadmap}
          onToggleSubtask={handleToggleSubtask}
          updatingSubtaskId={updatingSubtaskId}
        />
      ) : (
        <div className="bg-white border border-paper-200 rounded-2xl p-12 text-center">
          <Map className="h-12 w-12 text-accent-300 mx-auto mb-4" />
          <EmptyState
            title="Build your learning path"
            message="Tell us how you learn best, and we'll build a personalized roadmap around your goal."
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Generate Roadmap
              </button>
            }
          />
        </div>
      )}
      </div>

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
    </div>
  );
}
