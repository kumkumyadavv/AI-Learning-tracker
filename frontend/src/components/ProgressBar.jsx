export default function ProgressBar({ value, size = 'md' }) {
  const pct = Math.max(0, Math.min(100, value));
  const height = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2.5' : 'h-1.5';

  return (
    <div className={`w-full ${height} bg-paper-200 overflow-hidden`}>
      <div
        className={`${height} bg-accent-600 transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
