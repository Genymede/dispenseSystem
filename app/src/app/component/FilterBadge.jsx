import React from 'react';
import { XCircle } from 'lucide-react';
export default function FilterBadge({ label, value, onClear, icon: Icon }) {
  return (
    <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
      <Icon className="h-3 w-3 mr-1" />
      <span className="mr-2">{label}: {value}</span>
      <button
        onClick={onClear}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
      >
        <XCircle className="h-3 w-3" />
      </button>
    </div>
  );
}