"use client";
import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  onImageUpload: (files: File[]) => void;
  onBack: () => void;
  onSubmit: (files: File[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  onImageUpload,
  onBack,
  onSubmit,
  maxImages = 10
}: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  // Process selected files
  const processFiles = (newFiles: File[]) => {
    const remainingSlots = maxImages - images.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      const updatedImages = [...images, ...filesToAdd];
      setImages(updatedImages);
      onImageUpload(updatedImages);
    }

    if (newFiles.length > remainingSlots) {
      alert(`You can only upload up to ${maxImages} images. ${remainingSlots} images added.`);
    }
  };

  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  // Handle drop - FIXED: Changed from HTMLLIElement to HTMLDivElement
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      processFiles(imageFiles);
    } else {
      alert('Please drop only image files.');
    }
  }, [images, maxImages]);

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImageUpload(newImages);
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(images);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: "20px" }}>
      <style>{`
        .upload-container {
          border: 2px dashed #ccc;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          background: #fafafa;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .upload-container.dragging {
          border-color: #007bff;
          background: #f0f8ff;
        }
        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .image-preview-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .image-preview {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .image-preview img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }
        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(255,255,255,0.9);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-primary {
          background: linear-gradient(90deg, #007BFF, #0057FF);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.3s;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: white;
          color: #007BFF;
          border: 1px solid #007BFF;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>

      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
        Upload Business Images
      </h2>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Add photos of your business (Max {maxImages} images)
      </p>

      <form onSubmit={handleSubmit}>
        {/* Upload Area - FIXED: Changed from li to div */}
        <div
          className={`upload-container ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📷</div>
          <h3 style={{ marginBottom: 8, color: isDragging ? "#007bff" : "#333" }}>
            {isDragging ? "Drop images here" : "Click to upload or drag and drop"}
          </h3>
          <p style={{ color: "#666", fontSize: 14 }}>
            PNG, JPG, JPEG files (Max {maxImages} images)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 16 }}>
              Selected Images ({images.length}/{maxImages})
            </h3>
            <div className="image-preview-container">
              {images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={images.length === 0}
          >
            Submit Business Listing
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div style={{ marginTop: 24, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
        <h4 style={{ marginBottom: 8 }}>💡 Tips for better images:</h4>
        <ul style={{ color: "#666", fontSize: 14, lineHeight: 1.5, margin: 0, paddingLeft: 16 }}>
          <li>Use clear, high-quality photos</li>
          <li>Show your business exterior and interior</li>
          <li>Include photos of your products or services</li>
          <li>Ensure good lighting</li>
        </ul>
      </div>
    </div>
  );
}