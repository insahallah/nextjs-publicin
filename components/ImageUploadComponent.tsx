'use client';
import { useState, useRef } from 'react';

interface ImageUploadProps {
  onImageUpload: (files: File[]) => void;
  onBack: () => void;
  onSubmit: () => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUpload, 
  onBack, 
  onSubmit,
  maxImages = 5
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    // Check if adding these files would exceed max limit
    if (selectedImages.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Process each file
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);
      }
    });

    // Update state
    const updatedImages = [...selectedImages, ...newImages];
    const updatedPreviews = [...imagePreviews, ...newPreviews];
    
    setSelectedImages(updatedImages);
    setImagePreviews(updatedPreviews);
    
    // Pass to parent
    onImageUpload(updatedImages);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image deletion
  const handleDeleteImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    const updatedImages = selectedImages.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedImages(updatedImages);
    setImagePreviews(updatedPreviews);
    onImageUpload(updatedImages);
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const fileInputEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fileInputEvent);
    }
  };

  // Handle drag over
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // Handle form submission - FIXED
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if images are uploaded
    if (selectedImages.length === 0) {
      alert('Please upload at least one business image');
      return;
    }

    // Call parent's onSubmit WITHOUT any parameters
    onSubmit();
  };

  return (
    <div className="form-wrapper">
      <p className="addphoto_title color111 fw600">Add photos</p>
      <p className="addphoto_content color111">
        Showcase photos of your business to look authentic
      </p>

      <form onSubmit={handleSubmit} className="form">
        <ul className="addphoto_gallery">
          {/* Upload Button */}
          <li 
            tabIndex={0}
            aria-label="Upload photo"
            className="addphoto_photoupload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              name="files"
              id="files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="upload-placeholder">
              <svg 
                className="upload-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="font12 fw500 color007 mt-5">
                Add Photo
              </span>
              <span className="upload-hint font10 color666">
                Click or drag & drop
              </span>
            </div>
          </li>

          {/* Image Previews and Empty Slots */}
          {Array.from({ length: maxImages }).map((_, index) => {
            const hasImage = index < imagePreviews.length;
            
            return (
              <li key={index} className={`image-preview-item ${!hasImage ? 'empty-slot' : ''}`}>
                <div className="image-container">
                  {hasImage ? (
                    <>
                      <img
                        src={imagePreviews[index]}
                        alt={`Uploaded image ${index + 1}`}
                        className="preview-image"
                      />
                      <span 
                        className="iconwrap addphoto_delete"
                        onClick={() => handleDeleteImage(index)}
                        aria-label={`Delete image ${index + 1}`}
                      >
                        <svg 
                          className="delete-icon" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <div className="no-image-placeholder">
                      <svg className="no-image-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="no-image-text font10">No Image Available</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Image count and restrictions */}
        <div className="image-info">
          <p className="font12 color666">
            {selectedImages.length > 0 ? `${selectedImages.length} of ${maxImages} photos selected` : 'No photos selected - default image will be used'}
          </p>
          <p className="font10 color999">
            Supported formats: JPG, PNG, GIF • Max 10MB per image
          </p>
          {selectedImages.length === 0 && (
            <p className="font10 color007 mt-5">
              💡 Upload your business photos to make your listing more attractive
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="image-actions mt-20">
          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
          >
            Back
          </button>
          
          <button
            type="submit"
            className="primarybutton fw500"
          >
            Complete Business Listing
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .addphoto_title {
          font-size: 24px;
          margin-bottom: 10px;
          text-align: center;
        }

        .addphoto_content {
          font-size: 16px;
          margin-bottom: 30px;
          text-align: center;
          color: #666;
        }

        .addphoto_gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 15px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .addphoto_photoupload {
          aspect-ratio: 1;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .addphoto_photoupload:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .upload-icon {
          width: 32px;
          height: 32px;
          color: #6b7280;
        }

        .upload-hint {
          text-align: center;
        }

        .image-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .no-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: #f8f9fa;
          color: #6c757d;
          gap: 8px;
        }

        .no-image-icon {
          width: 32px;
          height: 32px;
        }

        .no-image-text {
          text-align: center;
        }

        .addphoto_delete {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .addphoto_delete:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        .delete-icon {
          width: 14px;
          height: 14px;
          color: white;
        }

        .empty-slot {
          background: #fafafa;
        }

        .image-info {
          margin-top: 20px;
          text-align: center;
        }

        .image-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
        }

        .secondary-button {
          flex: 1;
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .secondary-button:hover {
          background: #5a6268;
        }

        .primarybutton {
          flex: 1;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .primarybutton:hover {
          background: #2563eb;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .addphoto_gallery {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .addphoto_gallery {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Utility Classes */
        .mt-5 { margin-top: 5px; }
        .mt-20 { margin-top: 20px; }
        .font10 { font-size: 10px; }
        .font12 { font-size: 12px; }
        .color111 { color: #111; }
        .color007 { color: #007bff; }
        .color666 { color: #666; }
        .color999 { color: #999; }
        .fw500 { font-weight: 500; }
        .fw600 { font-weight: 600; }
      `}</style>
    </div>
  );
};

export default ImageUpload;