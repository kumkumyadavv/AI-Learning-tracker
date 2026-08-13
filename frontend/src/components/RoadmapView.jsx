import { useState } from 'react';
import {
  Check,
  Circle,
  ExternalLink,
  Video,
  BookOpen,
  PenTool,
  FileText,
  Link as LinkIcon,
  ChevronDown,
} from 'lucide-react';

function ResourceIcon({ type }) {
  const t = type.toLowerCase();
  if (t.includes('video')) return <Video className="h-3 w-3" />;
  if (t.includes('read') || t.includes('article') || t.includes('blog')) return <BookOpen className="h-3 w-3" />;
  if (t.includes('practice') || t.includes('exercise') || t.includes('code')) return <PenTool className="h-3 w-3" />;
  if (t.includes('doc')) return <FileText className="h-3 w-3" />;
  return <LinkIcon className="h-3 w-3" />;
}

function SubtaskItem({
  subtask,
  onToggle,
  updating,
}) {
  return (
    <div className="group/sub relative pl-1">
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(subtask)}
        disabled={updating}
        className="absolute left-0 top-0.5 shrink-0 disabled:opacity-40 transition-transform hover:scale-110"
        aria-label={subtask.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {subtask.completed ? (
          <div className="h-4 w-4 rounded-full bg-accent-600 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-paper-50" strokeWidth={3} />
          </div>
        ) : (
          <Circle className="h-4 w-4 text-ink-300 group-hover/sub:text-accent-500 transition-colors" />
        )}
      </button>

      <div className="pl-7">
        <span
          className={`text-sm leading-relaxed ${
            subtask.completed ? 'text-ink-400 line-through decoration-ink-300' : 'text-ink-700'
          }`}
        >
          {subtask.title}
        </span>

        {/* Resources — inline */}
        {subtask.resources.length > 0 && (
          <div className="mt-1.5 space-y-0.5">
            {subtask.resources.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-ink-400">
                  <ResourceIcon type={r.resource_type} />
                  <span className="capitalize">{r.resource_type}</span>
                </span>
                <span className="text-ink-500">·</span>
                <span className="text-ink-600 truncate">{r.title}</span>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-accent-600 hover:text-accent-700 shrink-0 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapView({
  roadmap,
  onToggleSubtask,
  updatingSubtaskId,
}) {
  const sorted = [...roadmap.phases].sort((a, b) => a.phase_order - b.phase_order);
  const [expanded, setExpanded] = useState(new Set(sorted.map((p) => p.id)));

  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-paper-200" />

      <div className="space-y-6">
        {sorted.map((phase) => {
          const isOpen = expanded.has(phase.id);
          const completed = phase.subtasks.filter((s) => s.completed).length;
          const total = phase.subtasks.length;
          const allDone = completed === total && total > 0;

          return (
            <div key={phase.id} className="relative pl-10">
              {/* Phase number on the timeline */}
              <div
                className={`absolute left-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 transition-colors ${
                  allDone
                    ? 'border-accent-600 bg-accent-600'
                    : completed > 0
                    ? 'border-accent-600 bg-paper-50'
                    : 'border-ink-300 bg-paper-50'
                }`}
              >
                {allDone && <Check className="h-2 w-2 text-paper-50" strokeWidth={3} />}
              </div>

              {/* Phase header */}
              <button
                type="button"
                onClick={() => toggle(phase.id)}
                className="w-full text-left mb-2"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-mono text-ink-400 tabular-nums">
                    {String(phase.phase_order).padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-serif text-ink-900">{phase.phase_title}</h3>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-ink-300 ml-auto shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-ink-300 ml-auto shrink-0 -rotate-90 transition-transform" />
                  )}
                </div>
                <p className="text-xs text-ink-400 mt-0.5 ml-7">
                  {completed} of {total} complete
                </p>
              </button>

              {/* Subtasks */}
              {isOpen && (
                <div className="ml-7 space-y-4 pt-1 pb-2">
                  {phase.subtasks.map((subtask) => (
                    <SubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      onToggle={onToggleSubtask}
                      updating={updatingSubtaskId === subtask.id}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
