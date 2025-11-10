// app/page.tsx
'use client';

import { useState } from 'react';
import AwesomeAuthModal from '../components/AwesomeAuthModal';

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AwesomeApp
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setAuthView('login');
                  setIsAuthModalOpen(true);
                }}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthView('signup');
                  setIsAuthModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AwesomeApp
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Experience the most awesome authentication system built with Next.js, Tailwind CSS, and modern design principles.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                setAuthView('signup');
                setIsAuthModalOpen(true);
              }}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => {
                setAuthView('login');
                setIsAuthModalOpen(true);
              }}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
            >
              Sign In
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Built with Next.js 14 for optimal performance and speed.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 text-xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful UI</h3>
              <p className="text-gray-600">Modern design with smooth animations and gradients.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Auth</h3>
              <p className="text-gray-600">Enterprise-grade security with validation and error handling.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AwesomeAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultView={authView}
      />
    </div>
  );
}