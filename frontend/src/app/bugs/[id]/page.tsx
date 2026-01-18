'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ApiError } from '@/lib/api';
import { BugReport, BugReportCreate, SEVERITY_OPTIONS, STATUS_OPTIONS } from '@/lib/types';
import BugForm from '@/components/BugForm';

export default function BugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [bug, setBug] = useState<BugReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBug = async () => {
      try {
        const data = await apiClient.getBug(id);
        setBug(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load bug report');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBug();
  }, [id]);

  const handleUpdate = async (data: BugReportCreate) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await apiClient.updateBug(id, data);
      setBug(updated);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update bug report');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bug?')) {
      return;
    }

    try {
      await apiClient.deleteBug(id);
      router.push('/bugs');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete bug report');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !bug) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/bugs" className="text-primary-600 hover:text-primary-700">
          Back to bugs
        </Link>
      </div>
    );
  }

  if (!bug) {
    return null;
  }

  const severityOption = SEVERITY_OPTIONS.find((s) => s.value === bug.severity);
  const statusOption = STATUS_OPTIONS.find((s) => s.value === bug.status);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <Link href="/bugs" className="text-primary-600 hover:text-primary-700">
          ← Back to bugs
        </Link>
      </nav>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {isEditing ? (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Bug Report</h1>
            <BugForm
              initialData={bug}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{bug.title}</h1>
                  <div className="flex flex-wrap gap-2">
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
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
                <p className="text-gray-900 whitespace-pre-wrap">{bug.description}</p>
              </div>

              {/* Steps to Reproduce */}
              {bug.steps_to_reproduce && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Steps to Reproduce</h2>
                  <p className="text-gray-900 whitespace-pre-wrap">{bug.steps_to_reproduce}</p>
                </div>
              )}

              {/* Expected vs Actual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bug.expected_result && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-2">Expected Result</h2>
                    <p className="text-gray-900 whitespace-pre-wrap">{bug.expected_result}</p>
                  </div>
                )}
                {bug.actual_result && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-2">Actual Result</h2>
                    <p className="text-gray-900 whitespace-pre-wrap">{bug.actual_result}</p>
                  </div>
                )}
              </div>

              {/* Environment */}
              {bug.environment && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Environment</h2>
                  <p className="text-gray-900">{bug.environment}</p>
                </div>
              )}

              {/* Tags */}
              {bug.tags && bug.tags.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {bug.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created by:</span>{' '}
                    <span className="text-gray-900">{bug.created_by.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>{' '}
                    <span className="text-gray-900">
                      {new Date(bug.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated:</span>{' '}
                    <span className="text-gray-900">
                      {new Date(bug.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
