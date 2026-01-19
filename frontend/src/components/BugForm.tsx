'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { BugReport, BugReportCreate, SEVERITY_OPTIONS, STATUS_OPTIONS } from '@/lib/types';

const bugSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title must be at most 255 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  steps_to_reproduce: z.string().optional(),
  expected_result: z.string().optional(),
  actual_result: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  environment: z.string().optional(),
  tags: z.string().optional(),
});

type BugFormData = z.infer<typeof bugSchema>;

interface BugFormProps {
  initialData?: BugReport;
  onSubmit: (data: BugReportCreate) => Promise<void>;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export default function BugForm({ initialData, onSubmit, isSubmitting, onCancel }: BugFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BugFormData>({
    resolver: zodResolver(bugSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          steps_to_reproduce: initialData.steps_to_reproduce || '',
          expected_result: initialData.expected_result || '',
          actual_result: initialData.actual_result || '',
          severity: initialData.severity,
          status: initialData.status,
          environment: initialData.environment || '',
          tags: initialData.tags?.join(', ') || '',
        }
      : {
          severity: 'medium',
          status: 'open',
        },
  });

  const handleFormSubmit = async (data: BugFormData) => {
    // Parse tags from comma-separated string
    const tags = data.tags
      ? data.tags
          .split(',')
          .map((tag: string) => tag.trim().toLowerCase())
          .filter((tag: string) => tag.length > 0)
      : [];

    await onSubmit({
      title: data.title,
      description: data.description,
      steps_to_reproduce: data.steps_to_reproduce || '',
      expected_result: data.expected_result || '',
      actual_result: data.actual_result || '',
      severity: data.severity,
      status: data.status,
      environment: data.environment || '',
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Brief description of the bug"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Detailed description of the bug"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Severity and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
            Severity <span className="text-red-500">*</span>
          </label>
          <select
            {...register('severity')}
            id="severity"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.severity && (
            <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            id="status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Steps to Reproduce */}
      <div>
        <label htmlFor="steps_to_reproduce" className="block text-sm font-medium text-gray-700 mb-1">
          Steps to Reproduce
        </label>
        <textarea
          {...register('steps_to_reproduce')}
          id="steps_to_reproduce"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="1. Open the app&#10;2. Click on...&#10;3. Observe..."
        />
      </div>

      {/* Expected and Actual Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="expected_result" className="block text-sm font-medium text-gray-700 mb-1">
            Expected Result
          </label>
          <textarea
            {...register('expected_result')}
            id="expected_result"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="What should happen"
          />
        </div>

        <div>
          <label htmlFor="actual_result" className="block text-sm font-medium text-gray-700 mb-1">
            Actual Result
          </label>
          <textarea
            {...register('actual_result')}
            id="actual_result"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="What actually happens"
          />
        </div>
      </div>

      {/* Environment */}
      <div>
        <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-1">
          Environment
        </label>
        <input
          {...register('environment')}
          type="text"
          id="environment"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., Windows 11 / Chrome 121"
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          {...register('tags')}
          type="text"
          id="tags"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Comma-separated tags, e.g., ui, button, login"
        />
        <p className="mt-1 text-xs text-gray-500">
          Separate tags with commas
        </p>
      </div>

      {/* Submit buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? initialData
              ? 'Saving...'
              : 'Creating...'
            : initialData
            ? 'Save Changes'
            : 'Create Bug Report'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        ) : (
          <Link
            href="/bugs"
            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
