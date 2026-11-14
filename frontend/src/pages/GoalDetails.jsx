import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { getGoal, getRoadmap, generateRoadmap, updateSubtask } from '../services';
import { ApiError } from '../services/api';
import RoadmapView from '../components/RoadmapView';
import GenerateRoadmapModal from '../components/GenerateRoadmapModal';
import './GoalDetails.css';

function getErrorMessage(error, fallback) {
  return error instanceof ApiError ? error.detail : fallback;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getProgress(value) {
  if (value === null || value === undefined) return null;
  const progress = Number(value);
  return Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : null;
}

export default function GoalDetails() {
  const { goalId } = useParams();
  const id = Number(goalId);
  const validId = Number.isInteger(id) && id > 0;

  const [goal, setGoal] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(true);
  const [error, setError] = useState('');
  const [roadmapError, setRoadmapError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [roadmapReloadKey, setRoadmapReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [updatingSubtaskId, setUpdatingSubtaskId] = useState(null);

  useEffect(() => {
    if (!validId) {
      setError('The goal ID is invalid.');
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setGoal(null);
    setError('');
    setLoading(true);

    getGoal(id)
      .then((result) => {
        if (!cancelled) setGoal(result);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(getErrorMessage(loadError, 'Failed to load goal details.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, validId]);

  useEffect(() => {
    if (!validId) {
      setRoadmapError('The goal ID is invalid.');
      setRoadmapLoading(false);
      return undefined;
    }

    let cancelled = false;
    setRoadmap(null);
    setRoadmapError('');
    setRoadmapLoading(true);

    getRoadmap(id)
      .then((result) => {
        if (cancelled) return;
        setRoadmap(result?.phases?.length ? result : null);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setRoadmapError(getErrorMessage(loadError, 'Failed to load the roadmap.'));
        }
      })
      .finally(() => {
        if (!cancelled) setRoadmapLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, validId, roadmapReloadKey]);

  async function handleGenerate(preferences) {
    if (generating || !validId) return;
    setGenError('');
    setGenerating(true);

    try {
      await generateRoadmap(id, preferences);
      setModalOpen(false);
      setRoadmapError('');
      setRoadmapLoading(true);

      try {
        const savedRoadmap = await getRoadmap(id);
        if (savedRoadmap?.phases?.length) {
          setRoadmap(savedRoadmap);
        } else {
          setRoadmap(null);
          setRoadmapError('The roadmap was generated, but no saved phases were returned.');
        }
      } catch (loadError) {
        setRoadmapError(
          `The roadmap was generated, but could not be reloaded: ${
            getErrorMessage(loadError, 'Failed to load the saved roadmap.')
          }`
        );
      } finally {
        setRoadmapLoading(false);
      }
    } catch (generationError) {
      setGenError(getErrorMessage(generationError, 'Failed to generate the roadmap.'));
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleSubtask(subtask) {
    if (updatingSubtaskId !== null) return;
    setUpdatingSubtaskId(subtask.id);
    setCompletionError('');

    try {
      const completed = !subtask.completed;
      const result = await updateSubtask(subtask.id, completed);

      setRoadmap((current) => {
        if (!current) return current;
        return {
          ...current,
          phases: current.phases.map((phase) => ({
            ...phase,
            subtasks: (phase.subtasks || []).map((item) =>
              item.id === subtask.id ? { ...item, completed } : item
            ),
          })),
        };
      });

      if (typeof result?.goal_progress === 'number' && Number.isFinite(result.goal_progress)) {
        setGoal((current) => (current ? { ...current, progress: result.goal_progress } : current));
      }
    } catch (updateError) {
      setCompletionError(getErrorMessage(updateError, 'Failed to update subtask completion.'));
    } finally {
      setUpdatingSubtaskId(null);
    }
  }

  const phases = [...(roadmap?.phases || [])].sort(
    (first, second) => first.phase_order - second.phase_order
  );
  const subtasks = phases.flatMap((phase) => phase.subtasks || []);
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;
  const progress = subtasks.length
    ? Math.round((completedSubtasks / subtasks.length) * 100)
    : getProgress(goal?.progress);
  const targetDate = formatDate(goal?.target_date);

  return (
    <div className="goal-details-page">
      <div className="goal-details-container">
        <Link className="goal-details-back" to="/goals">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to My Goals
        </Link>

        {loading ? (
          <div className="goal-details-state" role="status">
            <Loader2 className="goal-details-spinner" size={17} aria-hidden="true" />
            Loading goal details…
          </div>
        ) : error ? (
          <div className="goal-details-error" role="alert">{error}</div>
        ) : goal ? (
          <>
            <section className="goal-overview" aria-labelledby="goal-title">
              <div className="goal-overview-heading">
                <div>
                  <p className="goal-details-eyebrow">GOAL OVERVIEW</p>
                  <h1 id="goal-title">{goal.title}</h1>
                </div>
                {goal.status && <span className="goal-status">{goal.status}</span>}
              </div>

              {goal.description && <p className="goal-description">{goal.description}</p>}

              <div className="goal-overview-meta">
                {targetDate && (
                  <p>
                    <span className="goal-details-eyebrow">TARGET DATE</span>
                    <time dateTime={goal.target_date}>{targetDate}</time>
                  </p>
                )}
                {roadmap && (
                  <>
                    <p>
                      <span className="goal-details-eyebrow">PHASES</span>
                      <span>{phases.length}</span>
                    </p>
                    <p>
                      <span className="goal-details-eyebrow">SUBTASKS</span>
                      <span>{completedSubtasks} / {subtasks.length} complete</span>
                    </p>
                  </>
                )}
              </div>

              {progress !== null && (
                <div className="goal-overview-progress">
                  <div className="goal-progress-label">
                    <span>Overall progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div
                    className="goal-progress-track"
                    role="progressbar"
                    aria-label="Overall goal progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </section>

            <section className="goal-roadmap-section" aria-labelledby="roadmap-title">
              <div className="goal-roadmap-heading">
                <div>
                  <p className="goal-details-eyebrow">LEARNING PLAN</p>
                  <h2 id="roadmap-title">Roadmap</h2>
                </div>
                <div className="goal-roadmap-actions">
                  <button
                    className="goal-generate-button"
                    type="button"
                    onClick={() => {
                      setGenError('');
                      setModalOpen(true);
                    }}
                    disabled={generating || roadmapLoading}
                  >
                    {roadmap
                      ? <RefreshCw size={15} aria-hidden="true" />
                      : <Sparkles size={15} aria-hidden="true" />}
                    {roadmap ? 'Regenerate roadmap' : 'Generate roadmap'}
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {completionError && (
                <p className="goal-details-error" role="alert">{completionError}</p>
              )}

              {roadmapError && (
                <div className="goal-details-error goal-roadmap-error" role="alert">
                  <p>{roadmapError}</p>
                  <button
                    type="button"
                    onClick={() => setRoadmapReloadKey((key) => key + 1)}
                    disabled={roadmapLoading}
                  >
                    Retry loading roadmap
                  </button>
                </div>
              )}

              {roadmapLoading ? (
                <div className="goal-details-state" role="status">
                  <Loader2 className="goal-details-spinner" size={17} aria-hidden="true" />
                  Loading roadmap…
                </div>
              ) : roadmap ? (
                <RoadmapView
                  roadmap={roadmap}
                  onToggleSubtask={handleToggleSubtask}
                  updatingSubtaskId={updatingSubtaskId}
                />
              ) : (
                <div className="goal-roadmap-empty">
                  <h3>No roadmap yet</h3>
                  <p>Generate a roadmap to see its phases, subtasks, and resources here.</p>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>

      <GenerateRoadmapModal
        open={modalOpen}
        onClose={() => {
          if (!generating) {
            setModalOpen(false);
            setGenError('');
          }
        }}
        onGenerate={handleGenerate}
        loading={generating}
        error={genError}
        hasRoadmap={Boolean(roadmap)}
      />
    </div>
  );
}
