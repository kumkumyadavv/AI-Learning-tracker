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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white border border-paper-200 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-paper-200 bg-gradient-to-r from-paper-50 to-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 mb-1">Setup Wizard</p>
            <h2 className="text-2xl font-bold text-ink-900">Generate Your Roadmap</h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-8 space-y-8">
          {/* Q1 — Skill level */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 mb-3">Question 1</p>
            <label className="block text-base font-semibold text-ink-900 mb-4">
              What&apos;s your current skill level?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {skillLevels.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSkillLevel(s.value)}
                  className={`text-left px-4 py-3 rounded-lg border-2 font-medium transition-all transform hover:scale-105 ${
                    skillLevel === s.value
                      ? 'border-accent-600 bg-accent-50 text-accent-700'
                      : 'border-paper-200 bg-white text-ink-800 hover:border-paper-300'
                  }`}
                >
                  <span className="block text-sm font-bold">{s.label}</span>
                  <span className="block text-xs text-ink-500 mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Q2 — Daily hours */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 mb-3">Question 2</p>
            <label className="block text-base font-semibold text-ink-900 mb-6">
              How much time can you dedicate daily?
            </label>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-5xl font-bold text-accent-600 tabular-nums">{dailyHours}</span>
              <span className="text-lg text-ink-600 font-medium">hour{dailyHours !== 1 ? 's' : ''}/day</span>
            </div>
            <input
              id="dailyHours"
              type="range"
              min={1}
              max={12}
              step={1}
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full h-2 bg-paper-200 rounded-full appearance-none cursor-pointer accent-accent-600"
            />
            <div className="flex justify-between text-xs font-semibold text-ink-500 mt-3">
              <span>1h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Q3 — Learning style */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 mb-3">Question 3</p>
            <label className="block text-base font-semibold text-ink-900 mb-4">
              What's your preferred learning style?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {learningStyles.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setLearningStyle(s.value)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all transform hover:scale-105 ${
                    learningStyle === s.value
                      ? 'border-accent-600 bg-accent-50 text-accent-700'
                      : 'border-paper-200 bg-white text-ink-700 hover:border-paper-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-6 border-t border-paper-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-ink-300 disabled:to-ink-300 px-4 py-3 text-base font-semibold text-white rounded-lg shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  Generate Roadmap
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-sm font-semibold text-ink-600 hover:text-ink-900 disabled:opacity-50 transition-colors px-4 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
