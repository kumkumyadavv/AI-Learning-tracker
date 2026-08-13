import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  return (
    <div className="flex items-start gap-3 border border-error-200 bg-error-50 px-5 py-4 rounded-lg text-sm text-error-800 font-medium">
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-error-600" />
      <span>{message}</span>
    </div>
  );
}
