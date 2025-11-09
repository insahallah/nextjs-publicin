// components/ListingsContainer.tsx - Updated
'use client';

import { useState } from 'react';
import ListingCard from './ListingCard';
import ReviewModal from './ReviewModal';

interface ListingsContainerProps {
  initialListings: any[];
  categoryName: string;
  location: string;
  fallbackImage: string;
  onOpenReviewModal?: (business: any) => void;
}

export default function ListingsContainer({
  initialListings,
  categoryName,
  location,
  fallbackImage,
  onOpenReviewModal
}: ListingsContainerProps) {
  const [listings] = useState(initialListings);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [shouldReopenReviewAfterLogin, setShouldReopenReviewAfterLogin] = useState(false);

  const handleOpenReviewModal = (business: any) => {
    setSelectedBusiness(business);
    setIsReviewModalOpen(true);
    setShouldReopenReviewAfterLogin(false);
    
    // Notify parent component if needed
    if (onOpenReviewModal) {
      onOpenReviewModal(business);
    }
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setShouldReopenReviewAfterLogin(false);
  };

  const handleSubmitReview = async (reviewData: any) => {
    console.log('Submitting review:', {
      business: selectedBusiness,
      review: reviewData
    });

    // Here you would call your API to submit the review
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - show confirmation
      alert('Thank you for your review!');
      handleCloseReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleLoginRequest = () => {
    setShouldReopenReviewAfterLogin(true);
    setIsReviewModalOpen(false);
    
    // Trigger your login modal or redirect to login
    console.log('Login requested for review');
    // Example: open login modal or redirect
    // window.dispatchEvent(new CustomEvent('openLoginModal'));
  };

  return (
    <div className="space-y-6">
      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-6">
        {listings.map((listing, index) => (
          <ListingCard
            key={listing.id || index}
            listing={listing}
            fallbackImage={fallbackImage}
            categoryName={categoryName}
            onReviewClick={() => handleOpenReviewModal(listing)}
          />
        ))}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmit={handleSubmitReview}
        businessName={selectedBusiness?.displayName}
        businessImages={selectedBusiness?.images}
        onLoginRequest={handleLoginRequest}
      />
    </div>
  );
}