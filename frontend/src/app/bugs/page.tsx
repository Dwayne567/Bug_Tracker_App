'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, ApiError } from '@/lib/api';
import { BugReport, BugFilters, Severity, Status, SEVERITY_OPTIONS, STATUS_OPTIONS } from '@/lib/types';
import BugCard from '@/components/BugCard';

export default function BugsListPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BugFilters>({
    ordering: '-created_at',
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const fetchBugs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getBugs({ ...filters, page: currentPage });
      setBugs(response.results);
      setTotalCount(response.count);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load bugs');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const handleFilterChange = (key: keyof BugFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bug?')) {
      return;
    }

    try {
      await apiClient.deleteBug(id);
      fetchBugs();
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message);
      }
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bug Reports</h1>
        <Link
          href="/bugs/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          New Bug Report
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search title or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Severity filter */}
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              id="severity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All severities</option>
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="ordering" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="ordering"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.ordering || '-created_at'}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
            >
              <option value="-created_at">Newest first</option>
              <option value="created_at">Oldest first</option>
              <option value="-updated_at">Recently updated</option>
              <option value="title">Title A-Z</option>
              <option value="-title">Title Z-A</option>
              <option value="severity">Severity (Low to Critical)</option>
              <option value="-severity">Severity (Critical to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Bug list */}
      {!isLoading && bugs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">No bug reports found</p>
          <Link
            href="/bugs/new"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Create your first bug report
          </Link>
        </div>
      )}

      {!isLoading && bugs.length > 0 && (
        <>
          <div className="grid gap-4">
            {bugs.map((bug) => (
              <BugCard key={bug.id} bug={bug} onDelete={handleDelete} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {bugs.length} of {totalCount} bugs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={!hasPrevious}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasNext}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
