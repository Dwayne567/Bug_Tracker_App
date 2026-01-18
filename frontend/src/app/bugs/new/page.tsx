'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api';
import BugForm from '@/components/BugForm';
import { BugReportCreate } from '@/lib/types';

export default function NewBugPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BugReportCreate) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await apiClient.createBug(data);
      router.push('/bugs');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create bug report');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Bug Report</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <BugForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
