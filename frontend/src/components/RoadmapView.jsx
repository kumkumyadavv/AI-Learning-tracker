import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

function getSafeResourceUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function ResourceItem({ resource }) {
  const href = getSafeResourceUrl(resource.url);
  const type = typeof resource.resource_type === 'string' ? resource.resource_type : '';

  return (
    <li className="roadmap-resource">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <span className="roadmap-resource-copy">
            <span className="roadmap-resource-title">{resource.title}</span>
            {type && <span className="roadmap-resource-type">{type}</span>}
          </span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      ) : (
        <div className="roadmap-resource-copy">
          <span className="roadmap-resource-title">{resource.title}</span>
          {type && <span className="roadmap-resource-type">{type}</span>}
          {resource.url && <span className="roadmap-resource-url">{resource.url}</span>}
        </div>
      )}
    </li>
  );
}

function SubtaskItem({
  subtask,
  onToggle,
  updating,
  disabled,
}) {
  const resources = Array.isArray(subtask.resources) ? subtask.resources : [];

  return (
    <li className="roadmap-subtask">
      <label className="roadmap-subtask-check">
        <input
          type="checkbox"
          checked={Boolean(subtask.completed)}
          onChange={() => onToggle(subtask)}
          disabled={disabled}
          aria-label={`${subtask.completed ? 'Mark incomplete' : 'Mark complete'}: ${subtask.title}`}
        />
        <span aria-hidden="true" />
      </label>
      <div className="roadmap-subtask-content">
        <div className="roadmap-subtask-heading">
          <h4 data-completed={Boolean(subtask.completed)}>{subtask.title}</h4>
          {updating && <span className="roadmap-subtask-saving" role="status">Saving…</span>}
        </div>
        {subtask.description && (
          <p className="roadmap-subtask-description">{subtask.description}</p>
        )}
        {subtask.estimated_duration && (
          <p className="roadmap-subtask-duration">{subtask.estimated_duration}</p>
        )}
        {resources.length > 0 && (
          <ul className="roadmap-resources" aria-label={`Resources for ${subtask.title}`}>
            {resources.map((resource, index) => (
              <ResourceItem
                key={resource.id ?? `${resource.url}-${index}`}
                resource={resource}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default function RoadmapView({
  roadmap,
  onToggleSubtask,
  updatingSubtaskId,
}) {
  const [collapsedPhases, setCollapsedPhases] = useState(() => new Set());
  const phases = [...(roadmap.phases || [])].sort(
    (first, second) => first.phase_order - second.phase_order
  );
  const busy = updatingSubtaskId !== null;

  function togglePhase(id) {
    setCollapsedPhases((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="roadmap-phases">
      {phases.map((phase) => {
        const subtasks = Array.isArray(phase.subtasks) ? phase.subtasks : [];
        const completed = subtasks.filter((subtask) => subtask.completed).length;
        const total = subtasks.length;
        const progress = total ? Math.round((completed / total) * 100) : 0;
        const isComplete = total > 0 && completed === total;
        const status = total === 0
          ? 'No subtasks'
          : isComplete
          ? 'Complete'
          : completed > 0
          ? 'In progress'
          : 'Not started';
        const isOpen = !collapsedPhases.has(phase.id);
        const phaseOrder = Number.isFinite(Number(phase.phase_order))
          ? String(phase.phase_order).padStart(2, '0')
          : '';

        return (
          <section className="roadmap-phase" key={phase.id}>
            <button
              className="roadmap-phase-toggle"
              type="button"
              onClick={() => togglePhase(phase.id)}
              aria-expanded={isOpen}
              aria-label={`Toggle ${phase.phase_title}, ${status}, ${completed} of ${total} subtasks complete`}
            >
              <span className="roadmap-phase-order">
                {phaseOrder ? `PHASE ${phaseOrder}` : 'PHASE'}
              </span>
              <span className="roadmap-phase-main">
                <span className="roadmap-phase-title">{phase.phase_title}</span>
                {phase.description && (
                  <span className="roadmap-phase-description">{phase.description}</span>
                )}
              </span>
              <span className="roadmap-phase-summary">
                <span className="roadmap-phase-status" data-complete={isComplete}>
                  {status}
                </span>
                <span className="roadmap-phase-count">{completed}/{total}</span>
                <span
                  className="roadmap-phase-progress"
                  aria-hidden="true"
                >
                  <span style={{ width: `${progress}%` }} />
                </span>
              </span>
              <ChevronDown
                className="roadmap-phase-chevron"
                size={17}
                aria-hidden="true"
                data-open={isOpen}
              />
            </button>

            {isOpen && (
              <div className="roadmap-phase-content">
                {subtasks.length > 0 ? (
                  <ul className="roadmap-subtasks">
                    {subtasks.map((subtask) => (
                      <SubtaskItem
                        key={subtask.id}
                        subtask={subtask}
                        onToggle={onToggleSubtask}
                        updating={updatingSubtaskId === subtask.id}
                        disabled={busy}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="roadmap-empty-phase">No subtasks are available for this phase.</p>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
