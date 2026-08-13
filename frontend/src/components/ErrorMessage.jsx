import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  return (
    <div className="flex items-start gap-2 border-l-2 border-red-500 bg-red-50/60 px-4 py-3 text-sm text-red-800">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
      <span>{message}</span>
    </div>
  );
}
