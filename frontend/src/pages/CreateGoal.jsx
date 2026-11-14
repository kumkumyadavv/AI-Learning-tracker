import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { createGoal, generateRoadmap } from '../services';
import { ApiError } from '../services/api';
import './CreateGoal.css';

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

function getErrorMessage(error, fallback) {
  return error instanceof ApiError ? error.detail : fallback;
}

export default function CreateGoal() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [dailyHours, setDailyHours] = useState(2);
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [titleError, setTitleError] = useState('');
  const [createError, setCreateError] = useState('');
  const [roadmapError, setRoadmapError] = useState('');
  const [createdGoal, setCreatedGoal] = useState(null);
  const [submitting, setSubmitting] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const shouldGenerate = event.nativeEvent.submitter?.value === 'generate';

    setTitleError('');
    setCreateError('');
    setRoadmapError('');

    if (!createdGoal && !title.trim()) {
      setTitleError('Enter a goal title.');
      document.getElementById('goal-title')?.focus();
      return;
    }

    setSubmitting(shouldGenerate ? 'create-and-generate' : 'create');
    let goal = createdGoal;

    try {
      if (!goal) {
        goal = await createGoal({
          title: title.trim(),
          description: description.trim(),
          target_date: targetDate || null,
        });
        setCreatedGoal(goal);
      }

      if (!shouldGenerate) {
        navigate(`/goals/${goal.id}`);
        return;
      }

      setSubmitting('generate');
      try {
        await generateRoadmap(goal.id, {
          skill_level: skillLevel,
          daily_hours: Number(dailyHours),
          learning_style: learningStyle,
        });
        navigate(`/goals/${goal.id}`);
      } catch (error) {
        setRoadmapError(getErrorMessage(error, 'Failed to generate the roadmap.'));
      }
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Failed to create the goal.'));
    } finally {
      setSubmitting('');
    }
  }

  const goalFieldsLocked = Boolean(createdGoal);
  const fieldsDisabled = goalFieldsLocked || submitting !== '';

  return (
    <div className="create-goal-page">
      <div className="create-goal-container">
        <Link className="create-goal-back" to="/goals">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to My Goals
        </Link>

        <header className="create-goal-heading">
          <p className="create-goal-eyebrow">NEW GOAL</p>
          <h1>What do you want to learn?</h1>
          <p>Define your goal and choose how to shape its learning roadmap.</p>
        </header>

        {createError && (
          <p className="create-goal-error" role="alert">{createError}</p>
        )}

        {roadmapError && createdGoal && (
          <div className="create-goal-error" role="alert">
            <p>Goal created, but the roadmap could not be generated: {roadmapError}</p>
            <Link to={`/goals/${createdGoal.id}`}>Open goal details to continue</Link>
          </div>
        )}

        {createdGoal && !roadmapError && submitting === '' && (
          <p className="create-goal-notice" role="status">
            Goal created. Generate its roadmap or open the goal details.
          </p>
        )}

        <form className="create-goal-form" onSubmit={handleSubmit} noValidate>
          <div className="create-goal-columns">
            <section className="create-goal-section" aria-labelledby="goal-details-title">
              <p className="create-goal-section-label">01 / GOAL</p>
              <h2 id="goal-details-title">Goal details</h2>

              <div className="create-goal-field">
                <label htmlFor="goal-title">
                  Goal title <span>Required</span>
                </label>
                <input
                  id="goal-title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (event.target.value.trim()) setTitleError('');
                  }}
                  placeholder="What are you aiming to learn?"
                  disabled={fieldsDisabled}
                  aria-required="true"
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? 'goal-title-error' : 'goal-title-help'}
                />
                {titleError ? (
                  <p className="create-goal-field-error" id="goal-title-error">
                    {titleError}
                  </p>
                ) : (
                  <p className="create-goal-help" id="goal-title-help">
                    Keep it focused and specific.
                  </p>
                )}
              </div>

              <div className="create-goal-field">
                <label htmlFor="goal-description">
                  Description <span>Optional</span>
                </label>
                <textarea
                  id="goal-description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add context or an outcome you have in mind."
                  disabled={fieldsDisabled}
                />
                <p className="create-goal-help">
                  A little context can help clarify the goal.
                </p>
              </div>

              <div className="create-goal-field">
                <label htmlFor="goal-target-date">
                  Target completion date <span>Optional</span>
                </label>
                <input
                  id="goal-target-date"
                  type="date"
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  disabled={fieldsDisabled}
                />
              </div>
            </section>

            <section className="create-goal-section" aria-labelledby="roadmap-setup-title">
              <p className="create-goal-section-label">02 / ROADMAP</p>
              <h2 id="roadmap-setup-title">Roadmap preferences</h2>
              <p className="create-goal-section-description">
                These preferences are sent to the existing roadmap generator.
              </p>

              <div className="create-goal-field">
                <label htmlFor="skill-level">
                  Current skill level <span>Required</span>
                </label>
                <select
                  id="skill-level"
                  value={skillLevel}
                  onChange={(event) => setSkillLevel(event.target.value)}
                  disabled={submitting !== ''}
                  aria-required="true"
                >
                  {skillLevels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                <p className="create-goal-help">
                  Choose the level that best describes your experience.
                </p>
              </div>

              <div className="create-goal-field">
                <div className="create-goal-range-label">
                  <label htmlFor="daily-hours">
                    Daily available learning hours <span>Required</span>
                  </label>
                  <output htmlFor="daily-hours">
                    {dailyHours} {dailyHours === 1 ? 'hour' : 'hours'}
                  </output>
                </div>
                <input
                  id="daily-hours"
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={dailyHours}
                  onChange={(event) => setDailyHours(Number(event.target.value))}
                  disabled={submitting !== ''}
                  aria-required="true"
                />
                <p className="create-goal-help">
                  Select between 1 and 12 hours, matching the existing roadmap setup.
                </p>
              </div>

              <div className="create-goal-field">
                <label htmlFor="learning-style">
                  Learning style / preferences <span>Required</span>
                </label>
                <select
                  id="learning-style"
                  value={learningStyle}
                  onChange={(event) => setLearningStyle(event.target.value)}
                  disabled={submitting !== ''}
                  aria-required="true"
                >
                  {learningStyles.map((style) => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </select>
                <p className="create-goal-help">
                  Select a preference used by the existing roadmap generator.
                </p>
              </div>
            </section>
          </div>

          <div className="create-goal-actions">
            {createdGoal ? (
              <Link className="create-goal-secondary" to={`/goals/${createdGoal.id}`}>
                Open goal details
              </Link>
            ) : (
              <button
                className="create-goal-secondary"
                type="submit"
                value="create"
                disabled={submitting !== ''}
              >
                {submitting === 'create' || submitting === 'create-and-generate'
                  ? 'Creating goal…'
                  : 'Create goal only'}
              </button>
            )}

            <button
              className="create-goal-primary"
              type="submit"
              value="generate"
              disabled={submitting !== ''}
            >
              {submitting === 'generate' || submitting === 'create-and-generate' ? (
                <>
                  <Loader2 size={16} className="create-goal-spinner" aria-hidden="true" />
                  {submitting === 'create-and-generate' ? 'Creating goal…' : 'Generating roadmap…'}
                </>
              ) : (
                <>
                  {createdGoal ? 'Retry roadmap generation' : 'Create goal & generate roadmap'}
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
