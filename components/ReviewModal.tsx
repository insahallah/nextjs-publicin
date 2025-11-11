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
  initialRating?: number;
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  businessName = "Business",
  businessImages = [],
  onLoginRequest,
  initialRating = 0
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [userName, setUserName] = useState('');

  // Get business image URL
  const getBusinessImage = () => {
    if (!businessImages || businessImages.length === 0) {
      return '/default-business.jpg';
    }
    
    const firstImage = businessImages[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    if (firstImage.path) {
      return `https://allupipay.in/publicsewa/images/${firstImage.path}`;
    }
    
    return '/default-business.jpg';
  };

  const businessImageUrl = getBusinessImage();

  // Improved login status check
  useEffect(() => {
    const checkLoginStatus = () => {
      if (typeof window !== 'undefined') {
        try {
          // Check multiple possible storage locations
          const userDataStr = localStorage.getItem('userData') || 
                             localStorage.getItem('currentUser') || 
                             localStorage.getItem('user');
          
          const authToken = localStorage.getItem('authToken');
          
          console.log('🔍 ReviewModal - Checking login status:', {
            userDataStr: !!userDataStr,
            authToken: !!authToken
          });

          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              const hasValidUser = userData && (userData.id || userData.userId || userData.mobile);
              
              console.log('🔍 ReviewModal - User data found:', {
                userData,
                hasValidUser,
                id: userData?.id,
                mobile: userData?.mobile
              });

              if (hasValidUser) {
                setIsLoggedIn(true);
                setUserName(userData.fullName || userData.name || userData.mobile || 'User');
                setShowLoginPrompt(false);
                return;
              }
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
            }
          }

          // If we reach here, no valid user data found
          setIsLoggedIn(false);
          setUserName('');
          
        } catch (error) {
          console.error('Error checking login status:', error);
          setIsLoggedIn(false);
          setUserName('');
        }
      }
    };

    checkLoginStatus();
    
    // Listen for login events
    const handleUserLoggedIn = (event: any) => {
      console.log('🎉 ReviewModal - User logged in event received:', event.detail);
      setTimeout(() => {
        checkLoginStatus();
      }, 100);
    };

    const handleStorageChange = () => {
      console.log('📦 ReviewModal - Storage changed, checking login status');
      setTimeout(() => {
        checkLoginStatus();
      }, 100);
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('storage', handleStorageChange);
    
    // Check more frequently when modal is open
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(checkLoginStatus, 1000);
    }

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('storage', handleStorageChange);
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  // Reset form when modal opens/closes or initialRating changes
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment('');
      setHoverRating(0);
      
      // Re-check login status when modal opens
      setTimeout(() => {
        const checkLoginStatus = () => {
          if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('userData');
            const authToken = localStorage.getItem('authToken');
            console.log('🔄 ReviewModal Opened - Login status:', { userData: !!userData, authToken: !!authToken });
          }
        };
        checkLoginStatus();
      }, 100);
    }
  }, [isOpen, initialRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 ReviewModal - Submit clicked, login status:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('❌ User not logged in, showing login prompt');
      setShowLoginPrompt(true);
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🚀 Submitting review with data:', { rating, comment });
      await onSubmit({
        rating,
        comment: comment.trim()
      });
      
      // Reset form on success
      setRating(initialRating);
      setComment('');
      setHoverRating(0);
      setShowLoginPrompt(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    console.log('🔐 ReviewModal - Login button clicked');
    if (onLoginRequest) {
      onLoginRequest();
    } else {
      // Fallback: dispatch event for other components to handle
      window.dispatchEvent(new CustomEvent('openLoginModalFromReview'));
    }
    setShowLoginPrompt(false);
    onClose(); // Close review modal when opening login
  };

  const handleClose = () => {
    setShowLoginPrompt(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Header with Business Info */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">★</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Share Your Experience</h2>
                  <p className="text-gray-600 text-sm mt-1">Help others discover great businesses</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl bg-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
            >
              ×
            </button>
          </div>

          {/* Business Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Business Image */}
              <div className="flex-shrink-0">
                <img
                  src={businessImageUrl}
                  alt={businessName}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-blue-200 shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-business.jpg';
                  }}
                />
              </div>
              
              {/* Business Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">
                  {businessName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= Math.floor(initialRating)
                            ? 'text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {initialRating > 0 ? initialRating.toFixed(1) : 'New'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Your review will help this business grow
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Welcome Section */}
        {isLoggedIn && userName && (
          <div className="px-6 pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="text-green-800 font-medium text-sm">Welcome, {userName}!</p>
                <p className="text-green-700 text-xs">You're ready to share your review</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Prompt */}
        {showLoginPrompt && (
          <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🔒</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-800 text-lg">Login Required</h3>
                <p className="text-amber-700 text-sm mt-2 leading-relaxed">
                  Please login to share your valuable feedback about <strong>{businessName}</strong> and help other customers make better decisions.
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleLoginClick}
                    className="flex-1 bg-amber-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    🚀 Login Now
                  </button>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="px-4 py-3 border border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-100 transition-colors"
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
          {/* Star Rating Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              How would you rate <span className="text-blue-600">{businessName}</span>? *
            </label>
            <div className="flex flex-col items-center mb-2">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-4xl transition-all duration-200 transform hover:scale-125 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-500 drop-shadow-lg'
                        : 'text-gray-300 hover:text-yellow-300'
                    } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => isLoggedIn && setRating(star)}
                    onMouseEnter={() => isLoggedIn && setHoverRating(star)}
                    onMouseLeave={() => isLoggedIn && setHoverRating(0)}
                    disabled={!isLoggedIn}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              {/* Rating Labels */}
              <div className="flex justify-between w-full max-w-xs text-sm text-gray-500 mb-3">
                <span className="text-red-500 font-medium">Poor</span>
                <span className="text-yellow-500 font-medium">Okay</span>
                <span className="text-green-500 font-medium">Good</span>
                <span className="text-blue-500 font-medium">Great</span>
                <span className="text-purple-500 font-medium">Excellent</span>
              </div>
              
              {/* Selected Rating Display */}
              {rating > 0 && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                  <span className="text-blue-700 font-semibold text-sm">
                    You rated: {rating} star{rating > 1 ? 's' : ''} - {
                      rating === 1 ? 'Poor' :
                      rating === 2 ? 'Fair' :
                      rating === 3 ? 'Good' :
                      rating === 4 ? 'Very Good' : 'Excellent'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Comment Box */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-3">
              Share your experience with {businessName} {!isLoggedIn && '(Login to enable)'}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isLoggedIn 
                ? `Tell others about your experience with ${businessName}...\n\n• What did you like?\n• What could be improved?\n• Would you recommend it to others?`
                : "Please login to share your experience..."
              }
              rows={5}
              disabled={!isLoggedIn}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-500 resize-none transition-all ${
                !isLoggedIn 
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-white border-gray-300 text-gray-900 hover:border-blue-300'
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">
                {comment.length}/500 characters
              </div>
              {!isLoggedIn && (
                <div className="text-xs text-amber-600 font-medium">
                  🔒 Login to enable
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || !isLoggedIn}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                !isLoggedIn || rating === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : !isLoggedIn ? (
                'Login to Review'
              ) : (
                `Review ${businessName} ✨`
              )}
            </button>
          </div>

          {/* Login Prompt at Bottom */}
          {!isLoggedIn && !showLoginPrompt && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleLoginClick}
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline transition-colors"
              >
                Already have an account? Login to review {businessName}
              </button>
            </div>
          )}
        </form>

        {/* Footer Note */}
        <div className="px-6 pb-4">
          <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
            <p>Your honest review helps <strong>{businessName}</strong> improve and helps other customers make informed decisions.</p>
          </div>
        </div>
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
            interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          } ${
            star <= (hoverRating || rating)
              ? 'text-yellow-500'
              : 'text-gray-300'
          }`}
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