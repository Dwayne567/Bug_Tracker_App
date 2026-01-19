import React from 'react';
import Link from 'next/link';
import { BugReport, SEVERITY_OPTIONS, STATUS_OPTIONS } from '@/lib/types';

interface BugCardProps {
  bug: BugReport;
  onDelete: (id: string) => void;
}

export default function BugCard({ bug, onDelete }: BugCardProps) {
  const severityOption = SEVERITY_OPTIONS.find((s) => s.value === bug.severity);
  const statusOption = STATUS_OPTIONS.find((s) => s.value === bug.status);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            href={`/bugs/${bug.id}`}
            className="text-lg font-medium text-gray-900 hover:text-primary-600 truncate block"
          >
            {bug.title}
          </Link>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{bug.description}</p>
          
          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            {severityOption && (
              <span className={`px-2 py-1 text-xs font-medium rounded ${severityOption.color}`}>
                {severityOption.label}
              </span>
            )}
            {statusOption && (
              <span className={`px-2 py-1 text-xs font-medium rounded ${statusOption.color}`}>
                {statusOption.label}
              </span>
            )}
            {bug.tags && bug.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {tag}
              </span>
            ))}
            {bug.tags && bug.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{bug.tags.length - 3}
              </span>
            )}
          </div>
          
          {/* Metadata */}
          <div className="mt-3 text-xs text-gray-400">
            Updated {new Date(bug.updated_at).toLocaleDateString()}
          </div>
        </div>
        
        {/* Actions */}
        <div className="ml-4 flex-shrink-0 flex gap-2">
          <Link
            href={`/bugs/${bug.id}`}
            className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View
          </Link>
          <button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onDelete(bug.id);
            }}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
