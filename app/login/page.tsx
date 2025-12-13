// app/login/page.tsx - SIMPLE FIX
'use client';

import AwesomeLogin from '@/components/AwesomeLogin';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext'; // Make sure this is the correct path
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  // Destructure with the correct property name
  const { isLoggedIn, isLoading } = auth; // Use isLoggedIn instead of isAuthenticated

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, isLoading, router]);

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