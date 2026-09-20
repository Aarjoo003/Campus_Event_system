import React from 'react';
import { CalendarX, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no records matching your current criteria.',
  actionText = null,
  actionLink = null,
  onAction = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 my-4 shadow-sm">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
