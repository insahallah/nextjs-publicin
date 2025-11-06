'use client';

import { useState, useEffect } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: ReviewData) => void;
  businessName?: string;
  businessImages?: string[];
  onLoginRequest?: () => void;
}

interface ReviewData {
  rating: number;
  title: string;
  comment: string;
  recommend: boolean | null;
}

interface User {
  fullName: string;
  mobile: string;
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  businessName = "this business",
  businessImages = [],
  onLoginRequest
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check authentication status
  useEffect(() => {
    if (isOpen) {
      console.log('🔓 ReviewModal: Modal opened, checking auth status');
      checkAuthStatus();
      setShowLoginPrompt(false);
    }
  }, [isOpen]);

  // Real-time auth check
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen && !isLoggedIn) {
      console.log('🔄 ReviewModal: Starting auth check interval');
      interval = setInterval(() => {
        checkAuthStatus();
      }, 1000);
    }
    
    return () => {
      if (interval) {
        console.log('🧹 ReviewModal: Clearing auth check interval');
        clearInterval(interval);
      }
    };
  }, [isOpen, isLoggedIn]);

  // Listen for login success events
  useEffect(() => {
    const handleUserLoggedIn = (event: any) => {
      console.log('🎯 ReviewModal: userLoggedIn event received', event.detail);
      checkAuthStatus();
    };

    console.log('🔄 ReviewModal: Setting up userLoggedIn event listener');
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    
    return () => {
      console.log('🧹 ReviewModal: Cleaning up userLoggedIn event listener');
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, []);

  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      const wasLoggedIn = isLoggedIn;
      
      if (token && userData) {
        console.log('✅ ReviewModal: User is logged in');
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
        
        if (!wasLoggedIn && showLoginPrompt) {
          console.log('🔄 ReviewModal: User just logged in, closing login prompt');
          setShowLoginPrompt(false);
        }
      } else {
        console.log('❌ ReviewModal: User is not logged in');
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setComment('');
    setRecommend(null);
    setHoverRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      console.log('🔐 ReviewModal: User not logged in, showing login prompt');
      setShowLoginPrompt(true);
      
      // Notify parent component that login is required
      if (onLoginRequest) {
        console.log('🔄 ReviewModal: Calling onLoginRequest callback');
        onLoginRequest();
      }
      
      openLoginModal();
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a review title');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter your review comment');
      return;
    }

    if (recommend === null) {
      alert('Please select if you recommend this business');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: ReviewData = {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        recommend
      };

      await onSubmit(reviewData);
      
      // Reset form
      resetForm();
      
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setShowLoginPrompt(false);
    }
  };

  const openLoginModal = () => {
    console.log('🔄 ReviewModal: Opening login modal');
    
    // Close the review modal first
    onClose();
    
    // Small delay to ensure modal is closed before opening login
    setTimeout(() => {
      console.log('🎯 ReviewModal: Dispatching openLoginModal event');
      window.dispatchEvent(new CustomEvent('openLoginModal'));
    }, 300);
  };

  const handleLoginClick = () => {
    console.log('🔐 ReviewModal: Login to Review button clicked');
    
    // Notify parent component that login is required
    if (onLoginRequest) {
      console.log('🔄 ReviewModal: Calling onLoginRequest callback');
      onLoginRequest();
    }
    
    openLoginModal();
  };

  const handleLoginPromptClick = () => {
    console.log('🔐 ReviewModal: Open Login button clicked in prompt');
    
    // Notify parent component that login is required
    if (onLoginRequest) {
      console.log('🔄 ReviewModal: Calling onLoginRequest callback');
      onLoginRequest();
    }
    
    openLoginModal();
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>Write a Review</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Login Prompt Overlay */}
        {showLoginPrompt && (
          <div className="login-prompt-overlay">
            <div className="login-prompt">
              <div className="login-prompt-icon">🔒</div>
              <h3>Login Required</h3>
              <p>You need to login to submit a review. We'll automatically reopen this form after you login.</p>
              <div className="login-prompt-actions">
                <button 
                  className="cancel-prompt-button"
                  onClick={handleCloseLoginPrompt}
                >
                  Cancel Review
                </button>
                <button 
                  className="login-prompt-button"
                  onClick={handleLoginPromptClick}
                >
                  Login Now
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="review-form">
          {/* Business Info */}
          <div className="business-info">
            <div className="business-info-content">
              <div className="business-text">
                <h3>Reviewing: {businessName}</h3>
                {!isLoggedIn && (
                  <p className="login-reminder">
                    🔒 Please login to submit your review
                  </p>
                )}
                {isLoggedIn && (
                  <p className="login-success-message">
                    ✅ You are logged in as {user?.fullName}
                  </p>
                )}
              </div>
              
              {businessImages.length > 0 && (
                <div className="business-image-side">
                  <img 
                    src={businessImages[0]} 
                    alt={businessName}
                    className="single-business-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-image.jpg';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Auto Login Detection */}
          {!isLoggedIn && isOpen && (
            <div className="auto-login-detection">
              <div className="auto-login-indicator">
                <div className="spinner"></div>
                <span>We'll automatically detect when you're logged in.</span>
              </div>
            </div>
          )}

          {/* User Welcome Message */}
          {isLoggedIn && user && (
            <div className="user-welcome-banner">
              <div className="user-avatar">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <span>Reviewing as <strong>{user.fullName}</strong></span>
                <div className="login-success-badge">✅ Logged In</div>
              </div>
            </div>
          )}

          {/* Star Rating */}
          <div className="form-group">
            <label className="form-label">Overall Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= (hoverRating || rating) ? 'active' : ''} ${!isLoggedIn ? 'disabled' : ''}`}
                  onClick={() => isLoggedIn && setRating(star)}
                  onMouseEnter={() => isLoggedIn && setHoverRating(star)}
                  onMouseLeave={() => isLoggedIn && setHoverRating(0)}
                  disabled={!isLoggedIn}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="rating-text">
              {rating === 0 ? 'Select your rating' : 
               rating === 1 ? 'Poor' :
               rating === 2 ? 'Fair' :
               rating === 3 ? 'Good' :
               rating === 4 ? 'Very Good' : 'Excellent'}
              {!isLoggedIn && ' (Login to enable)'}
            </div>
          </div>

          {/* Review Title - FIXED RESPONSIVE */}
          <div className="form-group">
            <label htmlFor="review-title" className="form-label">
              Review Title *
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => isLoggedIn && setTitle(e.target.value)}
              placeholder={isLoggedIn ? "Summarize your experience" : "Please login to write a review"}
              className="form-input"
              maxLength={100}
              required
              disabled={!isLoggedIn}
            />
            <div className="character-count">{title.length}/100</div>
          </div>

          {/* Review Comment - FIXED RESPONSIVE */}
          <div className="form-group">
            <label htmlFor="review-comment" className="form-label">
              Your Review *
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => isLoggedIn && setComment(e.target.value)}
              placeholder={isLoggedIn ? "Share details of your experience..." : "Please login to write a review"}
              className="form-textarea"
              rows={5}
              maxLength={1000}
              required
              disabled={!isLoggedIn}
            />
            <div className="character-count">{comment.length}/1000</div>
          </div>

          {/* Recommendation */}
          <div className="form-group">
            <label className="form-label">Do you recommend this business? *</label>
            <div className="recommend-options">
              <label className={`radio-option ${!isLoggedIn ? 'disabled' : ''}`}>
                <input
                  type="radio"
                  name="recommend"
                  checked={recommend === true}
                  onChange={() => isLoggedIn && setRecommend(true)}
                  required
                  disabled={!isLoggedIn}
                />
                <span className="radio-custom"></span>
                Yes, I recommend
              </label>
              <label className={`radio-option ${!isLoggedIn ? 'disabled' : ''}`}>
                <input
                  type="radio"
                  name="recommend"
                  checked={recommend === false}
                  onChange={() => isLoggedIn && setRecommend(false)}
                  required
                  disabled={!isLoggedIn}
                />
                <span className="radio-custom"></span>
                No, I don't recommend
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            {!isLoggedIn ? (
              <button
                type="button"
                className="login-to-review-button"
                onClick={handleLoginClick}
              >
                🔒 Login to Review
              </button>
            ) : (
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            )}
          </div>

          {/* Auto-reopen instructions */}
          {!isLoggedIn && (
            <div className="auto-reopen-info">
              <p><strong>Automatic Reopen:</strong></p>
              <p>After you login, this review form will automatically reopen so you can continue writing your review.</p>
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        /* Login Prompt Overlay */
        .login-prompt-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 12px;
        }

        .login-prompt {
          text-align: center;
          padding: 30px;
          max-width: 400px;
        }

        .login-prompt-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .login-prompt h3 {
          margin: 0 0 12px 0;
          color: #dc3545;
          font-size: 24px;
        }

        .login-prompt p {
          margin: 0 0 24px 0;
          color: #666;
          line-height: 1.5;
        }

        .login-prompt-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cancel-prompt-button,
        .login-prompt-button {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-prompt-button {
          background: #6c757d;
          color: white;
        }

        .cancel-prompt-button:hover {
          background: #5a6268;
        }

        .login-prompt-button {
          background: #007bff;
          color: white;
        }

        .login-prompt-button:hover {
          background: #0056b3;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 12px 12px 0 0;
        }

        .modal-header h2 {
          margin: 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 28px;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .close-button:hover {
          color: #374151;
          background: #e5e7eb;
        }

        .review-form {
          padding: 24px;
          position: relative;
        }

        .user-welcome-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #28a745;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .user-info {
          color: #155724;
          font-size: 14px;
          flex: 1;
        }

        .login-success-badge {
          background: #28a745;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          margin-top: 4px;
          display: inline-block;
        }

        .business-info {
          margin-bottom: 24px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .business-info-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .business-text {
          flex: 1;
        }

        .business-text h3 {
          margin: 0;
          color: #374151;
          font-size: 16px;
          font-weight: 500;
        }

        .login-reminder {
          color: #dc3545;
          font-size: 12px;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        .login-success-message {
          color: #155724;
          font-size: 12px;
          margin: 4px 0 0 0;
          font-weight: 500;
          background: #d4edda;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #c3e6cb;
        }

        .business-image-side {
          flex-shrink: 0;
        }

        .single-business-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
        }

        /* Auto Login Detection */
        .auto-login-detection {
          margin-bottom: 20px;
          padding: 12px;
          background: #e3f2fd;
          border-radius: 8px;
          border-left: 4px solid #2196f3;
        }

        .auto-login-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1565c0;
          font-size: 14px;
        }

        .auto-login-indicator .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e3f2fd;
          border-top: 2px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #374151;
          font-weight: 500;
          font-size: 14px;
        }

        .star-rating {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }

        .star {
          background: none;
          border: none;
          font-size: 32px;
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 4px;
        }

        .star:hover,
        .star.active {
          color: #fbbf24;
          transform: scale(1.1);
        }

        .star.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .star.disabled:hover {
          color: #d1d5db;
          transform: none;
        }

        .rating-text {
          color: #6b7280;
          font-size: 14px;
          font-style: italic;
        }

        /* ✅ FIXED: RESPONSIVE FORM INPUTS */
        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          transition: all 0.3s ease;
          box-sizing: border-box; /* ✅ Important for responsive */
        }

        .form-input:disabled,
        .form-textarea:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-input:not(:disabled):focus,
        .form-textarea:not(:disabled):focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
          width: 100%; /* ✅ Ensure full width */
        }

        .character-count {
          text-align: right;
          color: #6b7280;
          font-size: 12px;
          margin-top: 4px;
        }

        .recommend-options {
          display: flex;
          gap: 24px;
          margin-top: 8px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .radio-option.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .radio-option:not(.disabled):hover {
          background: #f3f4f6;
        }

        .radio-option input {
          display: none;
        }

        .radio-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          position: relative;
          transition: all 0.2s ease;
        }

        .radio-option input:checked + .radio-custom {
          border-color: #3b82f6;
          background: #3b82f6;
        }

        .radio-option input:checked + .radio-custom::after {
          content: '';
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-button,
        .submit-button,
        .login-to-review-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          min-width: 140px;
          transition: all 0.2s ease;
        }

        .cancel-button {
          background: #f3f4f6;
          color: #374151;
        }

        .cancel-button:hover {
          background: #e5e7eb;
        }

        .submit-button {
          background: #3b82f6;
          color: white;
        }

        .submit-button:hover {
          background: #2563eb;
        }

        .login-to-review-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
        }

        .login-to-review-button:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auto-reopen-info {
          margin-top: 20px;
          padding: 16px;
          background: #e8f5e8;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }

        .auto-reopen-info p {
          margin: 0 0 8px 0;
          color: #2e7d32;
          font-size: 14px;
        }

        .auto-reopen-info p:last-child {
          margin-bottom: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ✅ FIXED: RESPONSIVE DESIGN FOR MOBILE */
        @media (max-width: 640px) {
          .modal-overlay {
            padding: 10px;
            align-items: flex-start; /* ✅ Better for mobile */
          }

          .modal-content {
            max-height: 95vh;
            margin-top: 20px; /* ✅ Space from top */
            margin-bottom: 20px; /* ✅ Space from bottom */
          }

          .modal-header {
            padding: 20px;
          }

          .modal-header h2 {
            font-size: 20px; /* ✅ Smaller heading on mobile */
          }

          .review-form {
            padding: 20px;
          }

          .business-info-content {
            flex-direction: column;
            gap: 12px;
          }

          .single-business-image {
            width: 60px; /* ✅ Smaller image on mobile */
            height: 60px;
          }

          .recommend-options {
            flex-direction: column;
            gap: 12px;
          }

          .form-actions {
            flex-direction: column-reverse;
            gap: 10px;
          }

          .cancel-button,
          .submit-button,
          .login-to-review-button {
            width: 100%;
            min-width: auto; /* ✅ Remove min-width on mobile */
          }

          .star {
            font-size: 28px; /* ✅ Smaller stars on mobile */
          }

          .login-prompt-actions {
            flex-direction: column;
          }

          .cancel-prompt-button,
          .login-prompt-button {
            width: 100%;
          }

          /* ✅ FIXED: BETTER TEXT INPUTS ON MOBILE */
          .form-input,
          .form-textarea {
            font-size: 16px; /* ✅ Prevent zoom on iOS */
            padding: 14px 16px; /* ✅ Better touch targets */
          }

          .form-textarea {
            min-height: 100px; /* ✅ Smaller textarea on mobile */
          }

          .user-welcome-banner {
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }

          .user-info {
            text-align: center;
          }
        }

        /* ✅ FIXED: EXTRA SMALL SCREENS */
        @media (max-width: 400px) {
          .modal-content {
            margin: 10px;
            border-radius: 8px;
          }

          .modal-header {
            padding: 16px;
          }

          .review-form {
            padding: 16px;
          }

          .form-input,
          .form-textarea {
            padding: 12px;
          }

          .star {
            font-size: 24px; /* ✅ Even smaller stars */
          }
        }
      `}</style>
    </div>
  );
}