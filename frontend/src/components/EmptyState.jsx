export default function EmptyState({ title, message, action }) {
  return (
    <div className="py-20 px-4">
      <div className="max-w-md">
        <div className="w-10 h-px bg-ink-300 mb-6" />
        <h3 className="text-xl font-serif text-ink-900 text-balance">{title}</h3>
        <p className="mt-2 text-sm text-ink-500 leading-relaxed max-w-sm">{message}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
