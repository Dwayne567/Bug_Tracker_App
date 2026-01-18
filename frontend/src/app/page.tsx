'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/bugs');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bug Tracker
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Track and manage software bugs efficiently. Document errors, 
          categorize by severity, and track resolution progress.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
