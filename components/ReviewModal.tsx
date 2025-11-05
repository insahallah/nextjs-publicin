'use client';

import { useState } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: ReviewData) => void;
  businessName?: string;
}

interface ReviewData {
  rating: number;
  title: string;
  comment: string;
  recommend: boolean | null;
}

export default function ReviewModal({ isOpen, onClose, onSubmit, businessName = "this business" }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      setRating(0);
      setTitle('');
      setComment('');
      setRecommend(null);
      
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
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
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

        <form onSubmit={handleSubmit} className="review-form">
          {/* Business Info */}
          <div className="business-info">
            <h3>Reviewing: {businessName}</h3>
          </div>

          {/* Star Rating */}
          <div className="form-group">
            <label className="form-label">Overall Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
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
            </div>
          </div>

          {/* Review Title */}
          <div className="form-group">
            <label htmlFor="review-title" className="form-label">
              Review Title *
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="form-input"
              maxLength={100}
              required
            />
            <div className="character-count">{title.length}/100</div>
          </div>

          {/* Review Comment */}
          <div className="form-group">
            <label htmlFor="review-comment" className="form-label">
              Your Review *
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your experience..."
              className="form-textarea"
              rows={5}
              maxLength={1000}
              required
            />
            <div className="character-count">{comment.length}/1000</div>
          </div>

          {/* Recommendation */}
          <div className="form-group">
            <label className="form-label">Do you recommend this business? *</label>
            <div className="recommend-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="recommend"
                  checked={recommend === true}
                  onChange={() => setRecommend(true)}
                  required
                />
                <span className="radio-custom"></span>
                Yes, I recommend
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="recommend"
                  checked={recommend === false}
                  onChange={() => setRecommend(false)}
                  required
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
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
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
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
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
          transition: all 0.2s ease;
        }

        .close-button:hover {
          color: #374151;
          background: #e5e7eb;
        }

        .review-form {
          padding: 24px;
        }

        .business-info {
          margin-bottom: 24px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .business-info h3 {
          margin: 0;
          color: #374151;
          font-size: 16px;
          font-weight: 500;
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

        /* Star Rating Styles */
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
          line-height: 1;
        }

        .star:hover,
        .star.active {
          color: #fbbf24;
          transform: scale(1.1);
        }

        .rating-text {
          color: #6b7280;
          font-size: 14px;
          font-style: italic;
        }

        /* Form Input Styles */
        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .character-count {
          text-align: right;
          color: #6b7280;
          font-size: 12px;
          margin-top: 4px;
        }

        /* Recommendation Options */
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

        .radio-option:hover {
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

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-button,
        .submit-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
        }

        .cancel-button {
          background: #f3f4f6;
          color: #374151;
        }

        .cancel-button:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .submit-button {
          background: #3b82f6;
          color: white;
        }

        .submit-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .submit-button:disabled,
        .cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .modal-overlay {
            padding: 10px;
          }

          .modal-content {
            max-height: 95vh;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-header h2 {
            font-size: 20px;
          }

          .review-form {
            padding: 20px;
          }

          .recommend-options {
            flex-direction: column;
            gap: 12px;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .submit-button {
            width: 100%;
          }

          .star {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}