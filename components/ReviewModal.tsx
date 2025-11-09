// components/ReviewModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  businessName?: string;
  businessImages?: any[];
  onLoginRequest?: () => void;
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  businessName = "Business",
  businessImages = [],
  onLoginRequest 
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('currentUser') || 
                        localStorage.getItem('userData') || 
                        localStorage.getItem('user');
        setIsLoggedIn(!!userData);
      }
    };

    checkLoginStatus();
    
    // Listen for login events
    const handleUserLoggedIn = () => {
      setIsLoggedIn(true);
      setShowLoginPrompt(false);
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setHoverRating(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        rating,
        comment: comment.trim()
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setHoverRating(0);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    if (onLoginRequest) {
      onLoginRequest();
    }
    setShowLoginPrompt(false);
  };

  const handleClose = () => {
    setShowLoginPrompt(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">Share your experience with {businessName}</p>
        </div>

        {/* Login Prompt */}
        {showLoginPrompt && (
          <div className="p-6 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-lg">🔒</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Login Required</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Please login to submit your review and help other customers.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleLoginClick}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Login Now
                  </button>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate your experience? *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-3xl transition-transform duration-200 hover:scale-110 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-500'
                      : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Comment Box */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
              Share your experience (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience... What did you like? What could be improved?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </div>
          </div>

          {/* User Info (if logged in) */}
          {isLoggedIn && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  U
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">You</p>
                  <p className="text-xs text-gray-500">Review will be posted publicly</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>

          {/* Login Reminder */}
          {!isLoggedIn && !showLoginPrompt && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span>🔒</span>
                <span>You'll need to login to submit your review</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Star Rating Component (Reusable)
export function StarRating({ 
  rating, 
  onRatingChange, 
  size = "text-xl",
  interactive = true 
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: string;
  interactive?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${size} transition-transform duration-200 ${
            interactive ? 'hover:scale-110' : ''
          } ${
            star <= (hoverRating || rating)
              ? 'text-yellow-500'
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
}