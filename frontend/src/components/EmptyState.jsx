export default function EmptyState({ title, message, action }) {
  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-ink-900 text-balance mb-3">{title}</h3>
      <p className="text-base text-ink-600 leading-relaxed max-w-sm mx-auto mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
