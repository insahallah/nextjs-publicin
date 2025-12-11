'use client';

import AwesomeSignup from '@/components/AwesomeSignup';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS2 } from '@/configs/api';

// ✅ Mock modal function (aapke asli modal function ke according adjust karein)
const modal = ({ icon, title, text }: { icon: string; title: string; text: string }) => {
  console.log(`${icon} Modal: ${title} - ${text}`);
  // Aapka modal implementation yahan aayega
  // Example: alert(`${title}: ${text}`);
  toast[icon === 'success' ? 'success' : 'error'](text, {
    duration: 4000,
    position: 'top-center',
  });
};

export default function RegisterPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string>('');

  // ✅ Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      console.log('📱 User already logged in, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [router]);

  // ✅ EXACT same logic as your handleAwesomeSignup
  const handleAwesomeSignup = async (signupData: any) => {
    setIsRegistering(true);
    setError('');
    console.log('🚀 Signup started with data:', signupData);

    try {
      const mobileNumber = signupData.mobile;

      // ✅ Use API_ENDPOINTS2
      const response = await fetch(API_ENDPOINTS2.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: signupData.fullName,
          mobile: mobileNumber,
          password: signupData.password
        })
      });

      console.log('📡 API Response status:', response.status);
      const data = await response.json();
      console.log('📦 API Response data:', data);
      
      if (response.ok && data.status === 'success') {
        console.log('✅ Signup API success');
        
        // ✅ Create EXACT same user object as your code
        const userObj = {
          id: data.id,
          fullName: data.fullName || data.name || signupData.fullName || 'User',
          name: data.name || data.fullName || signupData.fullName || 'User',
          mobile: data.mobile || mobileNumber,
          city: data.city || '',
          village: data.village || '',
          block: data.block || '',
          email: data.email || '',
          state: data.state || '',
          profile_image: data.profile_image || '',
          pin: data.pin || '',
          ...data
        };

        console.log('👤 User object created:', userObj);

        // ✅ Store in localStorage (EXACT same as your code)
        localStorage.setItem('authToken', data.token || data.id);
        localStorage.setItem('userData', JSON.stringify(userObj));

        // ✅ Verify storage
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');
        console.log('💾 Stored authToken:', storedToken);
        console.log('💾 Stored userData:', storedUser);

        // ✅ Since we're in Next.js, we can't directly use setIsLoggedIn/setUser
        // But we can dispatch events to notify other components
        window.dispatchEvent(new CustomEvent('userSignedUp', { 
          detail: { user: userObj } 
        }));
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { 
            user: userObj,
            userId: userObj.id,
            timestamp: new Date().toISOString()
          } 
        }));
        window.dispatchEvent(new Event('storage'));
        console.log('📢 Events dispatched');

        // ✅ Success message
        modal({
          icon: 'success',
          title: 'Registration successful!',
          text: 'You have been automatically logged in. Redirecting to dashboard...'
        });

        toast.success('Welcome! You are now logged in.');

        // ✅ Redirect to dashboard
        console.log('🔄 Redirecting to dashboard in 2 seconds...');
        setTimeout(() => {
          console.log('🔀 Now redirecting to dashboard');
          router.push('/UserDashboard');
        }, 2000);

      } else {
        const errorMessage = data.message || 'Registration failed. Please try again.';
        console.error('❌ Signup failed:', errorMessage);
        setError(errorMessage);
        
        modal({
          icon: 'error',
          title: 'Registration failed',
          text: errorMessage
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Network error: Please check your internet connection and try again.';
      console.error('❌ Registration error:', error);
      setError(errorMessage);
      
      modal({
        icon: 'error',
        title: 'Registration failed',
        text: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
      console.log('🏁 Signup process completed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Header with Back Button */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors group"
        >
          <svg 
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-md mb-6 animate-fadeIn">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signup Form */}
      <AwesomeSignup
        onSignup={handleAwesomeSignup}
        onSwitchToLogin={() => router.push('/login')}
        loading={isRegistering}
        className="w-full max-w-md"
      />

      {/* Additional Info */}
      <div className="w-full max-w-md mt-8 text-center">
        <p className="text-gray-600 text-sm">
          By registering, you agree to our{' '}
          <button 
            onClick={() => router.push('/terms')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button 
            onClick={() => router.push('/privacy')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Privacy Policy
          </button>
        </p>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
          <h4 className="font-medium text-green-800 mb-2">✨ Why Register?</h4>
          <ul className="text-sm text-green-700 space-y-1 text-left">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Access exclusive features
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save your progress
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Get personalized recommendations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}