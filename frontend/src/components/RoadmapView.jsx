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
    <div className="group/sub flex items-start gap-4 p-4 bg-white rounded-xl border border-paper-100 hover:border-paper-200 transition-all hover:shadow-sm">
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(subtask)}
        disabled={updating}
        className="flex-shrink-0 mt-1 disabled:opacity-40 transition-all"
        aria-label={subtask.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {subtask.completed ? (
          <div className="h-5 w-5 rounded-full bg-success-500 flex items-center justify-center flex-shrink-0">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        ) : (
          <Circle className="h-5 w-5 text-ink-300 group-hover/sub:text-accent-500 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium leading-relaxed block ${
            subtask.completed ? 'text-ink-400 line-through decoration-ink-300' : 'text-ink-800'
          }`}
        >
          {subtask.title}
        </span>

        {/* Resources — inline */}
        {subtask.resources.length > 0 && (
          <div className="mt-3 space-y-2">
            {subtask.resources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-paper-50 rounded-lg hover:bg-paper-100 transition-colors group/res text-xs"
              >
                <span className="inline-flex items-center gap-1.5 text-ink-500 font-medium flex-shrink-0">
                  <ResourceIcon type={r.resource_type} />
                  <span className="capitalize hidden sm:inline">{r.resource_type}</span>
                </span>
                <span className="text-ink-600 truncate flex-1 group-hover/res:text-accent-600 transition-colors">{r.title}</span>
                <ExternalLink className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
              </a>
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
    <div className="space-y-5">
      {sorted.map((phase, index) => {
        const isOpen = expanded.has(phase.id);
        const completed = phase.subtasks.filter((s) => s.completed).length;
        const total = phase.subtasks.length;
        const allDone = completed === total && total > 0;
        const inProgress = completed > 0 && !allDone;

        return (
          <div
            key={phase.id}
            className="bg-white border border-paper-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Phase header card */}
            <button
              type="button"
              onClick={() => toggle(phase.id)}
              className="w-full text-left p-6 sm:p-8 hover:bg-paper-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Phase badge */}
                <div
                  className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${
                    allDone
                      ? 'bg-success-500'
                      : inProgress
                      ? 'bg-accent-500'
                      : 'bg-ink-400'
                  }`}
                >
                  {allDone ? <Check className="h-6 w-6" strokeWidth={3} /> : index + 1}
                </div>

                {/* Phase info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-ink-900 leading-tight">
                    {phase.phase_title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <div className="w-24 bg-paper-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          allDone ? 'bg-success-500' : 'bg-accent-500'
                        }`}
                        style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-ink-600 font-medium whitespace-nowrap">
                      {completed}/{total}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronDown
                  className={`h-5 w-5 text-ink-400 flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Subtasks expanded content */}
            {isOpen && (
              <div className="border-t border-paper-100 px-6 sm:px-8 py-6 space-y-4 bg-paper-50/50">
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
  );
}
