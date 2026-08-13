import { useState } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

const skillLevels = [
  { value: 'beginner', label: 'Beginner', desc: 'New to the topic' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
  { value: 'advanced', label: 'Advanced', desc: 'Strong background' },
];

const learningStyles = [
  { value: 'practice', label: 'Practice' },
  { value: 'video', label: 'Video' },
  { value: 'reading', label: 'Reading' },
  { value: 'mixed', label: 'Mixed' },
];

export default function GenerateRoadmapModal({ open, onClose, onGenerate, loading, error }) {
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [dailyHours, setDailyHours] = useState(2);
  const [learningStyle, setLearningStyle] = useState('mixed');

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    await onGenerate({ skill_level: skillLevel, daily_hours: dailyHours, learning_style: learningStyle });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-paper-50 border border-paper-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-paper-200">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider-2 text-ink-400">Roadmap Generator</p>
            <h2 className="text-lg font-serif text-ink-900 mt-1">Build your learning path</h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-ink-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-8">
          {/* Q1 — Skill level */}
          <div>
            <p className="text-xs font-mono text-ink-400 mb-1">Question 01</p>
            <label className="block text-sm font-medium text-ink-800 mb-4">
              What&apos;s your current level?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {skillLevels.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSkillLevel(s.value)}
                  className={`text-left px-3 py-3 border transition-all ${
                    skillLevel === s.value
                      ? 'border-accent-600 bg-accent-50'
                      : 'border-paper-200 bg-transparent hover:border-ink-300'
                  }`}
                >
                  <span className={`block text-sm font-semibold ${skillLevel === s.value ? 'text-accent-700' : 'text-ink-800'}`}>
                    {s.label}
                  </span>
                  <span className="block text-xs text-ink-400 mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Q2 — Daily hours */}
          <div>
            <p className="text-xs font-mono text-ink-400 mb-1">Question 02</p>
            <label className="block text-sm font-medium text-ink-800 mb-4">
              How much time can you give each day?
            </label>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl font-serif text-accent-600 tabular-nums">{dailyHours}</span>
              <span className="text-sm text-ink-500">hours per day</span>
            </div>
            <input
              id="dailyHours"
              type="range"
              min={1}
              max={12}
              step={1}
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs font-mono text-ink-300 mt-1.5">
              <span>1h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Q3 — Learning style */}
          <div>
            <p className="text-xs font-mono text-ink-400 mb-1">Question 03</p>
            <label className="block text-sm font-medium text-ink-800 mb-4">
              How do you prefer to learn?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {learningStyles.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setLearningStyle(s.value)}
                  className={`px-3 py-2.5 text-sm font-medium border transition-all ${
                    learningStyle === s.value
                      ? 'border-accent-600 bg-accent-50 text-accent-700'
                      : 'border-paper-200 text-ink-600 hover:border-ink-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2 border-t border-paper-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-ink-900 px-4 py-3 text-sm font-semibold text-paper-50 hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating your roadmap…
                </>
              ) : (
                <>
                  Generate my roadmap
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-sm font-medium text-ink-500 hover:text-ink-900 disabled:opacity-50 transition-colors px-4 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
