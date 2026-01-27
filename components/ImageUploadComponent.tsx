"use client";
import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  onImageUpload: (files: File[]) => void;
  onBack: () => void;
  onSubmit: (files: File[]) => void;
  maxImages?: number;
  maxFileSizeMB?: number;
}

export default function ImageUpload({
  onImageUpload,
  onBack,
  onSubmit,
  maxImages = 10,
  maxFileSizeMB = 1
}: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to compress image
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
      
      // If file is already under size limit, return as is
      if (file.size <= maxSizeBytes) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions if image is too large
          const MAX_WIDTH = 1920;
          if (width > MAX_WIDTH) {
            height = Math.floor((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // Draw image with new dimensions
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }
              
              // Create new compressed file
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              console.log(`Compressed: ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
              
              // If still too large, try again with lower quality
              if (blob.size > maxSizeBytes && blob.size < file.size) {
                console.log('Still too large, trying more compression...');
                compressImage(compressedFile).then(resolve).catch(reject);
              } else {
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            0.85 // Initial quality (85%)
          );
        };
        
        img.onerror = () => reject(new Error('Image loading failed'));
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
    });
  };

  // Process files with compression
  const processFiles = async (newFiles: File[]) => {
    setIsCompressing(true);
    
    try {
      const remainingSlots = maxImages - images.length;
      const filesToProcess = newFiles.slice(0, remainingSlots);
      const compressedFiles: File[] = [];
      
      // Compress each file
      for (const file of filesToProcess) {
        try {
          // Check file type
          if (!file.type.startsWith('image/')) {
            alert(`${file.name} is not an image file. Only images are allowed.`);
            continue;
          }
          
          // Check if file is too large (optional warning)
          const fileSizeMB = file.size / (1024 * 1024);
          if (fileSizeMB > 10) { // Warn for files larger than 10MB
            if (!confirm(`${file.name} is ${fileSizeMB.toFixed(2)}MB. It will be compressed to under ${maxFileSizeMB}MB. Continue?`)) {
              continue;
            }
          }
          
          const compressedFile = await compressImage(file);
          compressedFiles.push(compressedFile);
          
        } catch (error) {
          console.error(`Error compressing ${file.name}:`, error);
          // If compression fails, use original file (but it will fail on server if too large)
          compressedFiles.push(file);
        }
      }
      
      if (compressedFiles.length > 0) {
        const updatedImages = [...images, ...compressedFiles];
        setImages(updatedImages);
        onImageUpload(updatedImages);
      }
      
      if (newFiles.length > remainingSlots) {
        alert(`You can only upload up to ${maxImages} images. ${compressedFiles.length} images added.`);
      }
      
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing images. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback((event: React.DragEvent) => {
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
    
    // Check file sizes before submission
    const oversizedFiles = images.filter(img => img.size > maxFileSizeMB * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      if (!confirm(`${oversizedFiles.length} image(s) are still over ${maxFileSizeMB}MB. They may fail to upload. Continue anyway?`)) {
        return;
      }
    }
    
    onSubmit(images);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
          position: relative;
        }
        .upload-container.dragging {
          border-color: #007bff;
          background: #f0f8ff;
        }
        .upload-container.disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
        .file-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 8px;
          font-size: 10px;
          text-align: center;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
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
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          border-radius: 12px;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
        Upload Business Images
      </h2>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Add photos of your business (Max {maxImages} images, Max {maxFileSizeMB}MB each)
      </p>

      <form onSubmit={handleSubmit}>
        {/* Upload Area */}
        <div
          className={`upload-container ${isDragging ? 'dragging' : ''} ${isCompressing ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={isCompressing ? undefined : handleDrop}
          onClick={isCompressing ? undefined : () => fileInputRef.current?.click()}
          aria-label="Upload photo"
        >
          {isCompressing && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Compressing images...</p>
              <p style={{ fontSize: 12, color: '#666' }}>Please wait</p>
            </div>
          )}
          
          <div className="upload-icon">📷</div>
          <h3 style={{ marginBottom: 8, color: isDragging ? "#007bff" : "#333" }}>
            {isDragging ? "Drop images here" : "Click to upload or drag and drop"}
          </h3>
          <p style={{ color: "#666", fontSize: 14 }}>
            PNG, JPG, JPEG files (Max {maxImages} images, {maxFileSizeMB}MB each)
          </p>
          <p style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
            Large images will be automatically compressed
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            style={{ display: "none" }}
            disabled={isCompressing}
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
                  <div className="file-info">
                    {formatFileSize(image.size)}
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                    disabled={isCompressing}
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
            disabled={isCompressing}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={images.length === 0 || isCompressing}
          >
            {isCompressing ? (
              <>
                <div style={{ 
                  width: 16, 
                  height: 16, 
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Processing...
              </>
            ) : (
              `Submit Business Listing (${images.length} images)`
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div style={{ marginTop: 24, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
        <h4 style={{ marginBottom: 8 }}>💡 Image Upload Tips:</h4>
        <ul style={{ color: "#666", fontSize: 14, lineHeight: 1.5, margin: 0, paddingLeft: 16 }}>
          <li>Images larger than {maxFileSizeMB}MB will be automatically compressed</li>
          <li>Maximum image width: 1920px (large images will be resized)</li>
          <li>Recommended formats: JPG, PNG</li>
          <li>Upload clear, well-lit photos of your business</li>
          <li>Include both exterior and interior shots</li>
          <li>Compression may take a moment for large files</li>
        </ul>
      </div>

      {/* Stats */}
      {images.length > 0 && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: "#e7f3ff", 
          borderRadius: 8,
          fontSize: 14 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Images:</span>
            <span><strong>{images.length}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span>Total Size:</span>
            <span><strong>{formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span>Oversized Images:</span>
            <span style={{ 
              color: images.filter(img => img.size > maxFileSizeMB * 1024 * 1024).length > 0 ? '#dc3545' : '#28a745'
            }}>
              <strong>{images.filter(img => img.size > maxFileSizeMB * 1024 * 1024).length}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}