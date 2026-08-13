export default function ProgressBar({ value, size = 'md' }) {
  const pct = Math.max(0, Math.min(100, value));
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`w-full ${height} bg-paper-200 rounded-full overflow-hidden shadow-inner`}>
      <div
        className={`${height} bg-gradient-to-r from-accent-500 to-accent-600 rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
