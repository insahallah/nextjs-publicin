// app/login/page.tsx
'use client';

import AwesomeLogin from '@/components/AwesomeLogin';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers'; // यह path सही है

import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <AwesomeLogin
        onSwitchToSignup={() => router.push('/signup')}
        onForgotPassword={() => router.push('/forgot-password')}
      />
    </div>
  );
}