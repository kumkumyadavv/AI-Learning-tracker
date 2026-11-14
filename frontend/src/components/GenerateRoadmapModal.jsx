import { useState } from 'react';
import { ArrowRight, Loader2, X } from 'lucide-react';

const skillLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const learningStyles = [
  { value: 'practice', label: 'Practice' },
  { value: 'video', label: 'Video' },
  { value: 'reading', label: 'Reading' },
  { value: 'mixed', label: 'Mixed' },
];

export default function GenerateRoadmapModal({
  open,
  onClose,
  onGenerate,
  loading,
  error,
  hasRoadmap,
}) {
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [dailyHours, setDailyHours] = useState(2);
  const [learningStyle, setLearningStyle] = useState('mixed');

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    await onGenerate({
      skill_level: skillLevel,
      daily_hours: dailyHours,
      learning_style: learningStyle,
    });
  }

  return (
    <div
      className="roadmap-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        className="roadmap-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="roadmap-modal-title"
      >
        <header className="roadmap-modal-header">
          <div>
            <p className="goal-details-eyebrow">ROADMAP SETUP</p>
            <h2 id="roadmap-modal-title">
              {hasRoadmap ? 'Regenerate roadmap' : 'Generate roadmap'}
            </h2>
          </div>
          <button
            type="button"
            className="roadmap-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close roadmap setup"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form className="roadmap-modal-form" onSubmit={handleSubmit}>
          <div className="goal-modal-field">
            <label htmlFor="roadmap-skill-level">Current skill level</label>
            <p>Choose the level that best matches your experience.</p>
            <select
              id="roadmap-skill-level"
              value={skillLevel}
              onChange={(event) => setSkillLevel(event.target.value)}
              disabled={loading}
            >
              {skillLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div className="goal-modal-field">
            <div className="goal-modal-range-heading">
              <label htmlFor="roadmap-daily-hours">Daily available learning hours</label>
              <output htmlFor="roadmap-daily-hours">
                {dailyHours} {dailyHours === 1 ? 'hour' : 'hours'}
              </output>
            </div>
            <p>Select between 1 and 12 hours per day.</p>
            <input
              id="roadmap-daily-hours"
              type="range"
              min="1"
              max="12"
              step="1"
              value={dailyHours}
              onChange={(event) => setDailyHours(Number(event.target.value))}
              disabled={loading}
            />
          </div>

          <div className="goal-modal-field">
            <label htmlFor="roadmap-learning-style">Learning style / preferences</label>
            <p>Select the format that works best for you.</p>
            <select
              id="roadmap-learning-style"
              value={learningStyle}
              onChange={(event) => setLearningStyle(event.target.value)}
              disabled={loading}
            >
              {learningStyles.map((style) => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="roadmap-modal-error" role="alert">{error}</p>}

          <footer className="roadmap-modal-actions">
            <button
              className="goal-modal-cancel"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button className="goal-generate-button" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="roadmap-modal-spinner" size={16} aria-hidden="true" />
                  Generating…
                </>
              ) : (
                <>
                  {hasRoadmap ? 'Regenerate roadmap' : 'Generate roadmap'}
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
