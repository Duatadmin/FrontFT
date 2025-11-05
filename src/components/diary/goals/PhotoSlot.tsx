import React, { useState } from 'react';
import { Camera, X, ArrowLeft, ArrowRight, Image, Plus, Calendar, Trash } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import useUserStore from '../../../store/useUserStore';
import type { ProgressPhoto } from '../../../store/diaryTypes';

/**
 * PhotoSlot Component
 * Allows users to view and upload progress photos to track physical changes
 */
const PhotoSlot: React.FC = () => {
  const { progressPhotos, addProgressPhoto, removeProgressPhoto } = useDiaryStore();
  const { user } = useUserStore();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  // Handle file selection for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadPreview(e.target.result as string);
        setIsUploading(true);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  // Handle photo upload
  const handleUploadPhoto = () => {
    if (!uploadPreview || !user?.id) return;
    
    const photoPayload: Omit<ProgressPhoto, 'id' | 'user_id'> = {
      url: uploadPreview,
      description: description.trim(),
      caption: description.trim(),
      date: new Date().toISOString(),
    };
    
    addProgressPhoto(photoPayload, user.id);
    setIsUploading(false);
    setUploadPreview(null);
    setDescription('');
    
    // Set the newly added photo as active
    setActiveIndex(progressPhotos.length);
  };
  
  // Handle photo deletion
  const handleDeletePhoto = (id: string) => {
    if (!user?.id) return;
    removeProgressPhoto(id, user.id);
    
    // Adjust active index if needed
    if (activeIndex >= progressPhotos.length - 1) {
      setActiveIndex(Math.max(0, progressPhotos.length - 2));
    }
  };
  
  // Navigate to previous photo
  const goToPrevious = () => {
    setActiveIndex((current) => Math.max(0, current - 1));
  };
  
  // Navigate to next photo
  const goToNext = () => {
    setActiveIndex((current) => Math.min(progressPhotos.length - 1, current + 1));
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (isUploading) {
    return (
      <div className="bg-neutral-800/50 rounded-2xl shadow-card p-5" data-testid="photo-slot-upload">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold flex items-center">
            <Camera className="text-accent-violet mr-2" size={18} />
            Upload Progress Photo
          </h3>
          <button
            onClick={() => {
              setIsUploading(false);
              setUploadPreview(null);
            }}
            className="p-1 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
            aria-label="Cancel upload"
            data-testid="cancel-upload"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-4">
          {uploadPreview && (
            <div className="relative mb-3">
              <img 
                src={uploadPreview} 
                alt="Photo preview" 
                className="w-full max-h-64 object-cover rounded-lg" 
                data-testid="photo-preview"
              />
            </div>
          )}
          
          <div className="w-full mb-4">
            <label htmlFor="photo-description" className="block text-xs text-text-secondary mb-1">
              Description (Optional)
            </label>
            <textarea
              id="photo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 text-sm bg-background-surface border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
              placeholder="E.g., Front view, Week 8 of training program..."
              rows={2}
              data-testid="photo-description-input"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setIsUploading(false);
              setUploadPreview(null);
            }}
            className="text-sm text-text-secondary"
            data-testid="cancel-upload-button"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadPhoto}
            className="bg-accent-violet text-white text-sm px-3 py-1.5 rounded-lg flex items-center hover:bg-accent-violet/90"
            data-testid="confirm-upload-button"
          >
            Save Photo
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-800/50 rounded-2xl shadow-card p-5" data-testid="photo-slot">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold flex items-center">
          <Camera className="text-accent-violet mr-2" size={18} />
          Progress Photos
        </h3>
        <label 
          htmlFor="photo-upload"
          className="p-1.5 rounded-lg text-sm font-medium flex items-center cursor-pointer bg-accent-violet/10 text-accent-violet"
          data-testid="upload-photo-button"
        >
          <Plus size={16} />
          <input 
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="photo-upload-input"
          />
        </label>
      </div>
      
      {progressPhotos.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-8 bg-neutral-900/70 border border-border-light rounded-lg overflow-hidden">
          <div className="rounded-full bg-neutral-800/50 p-3 mb-3">
            <Image className="text-text-tertiary" size={24} />
          </div>
          <p className="text-sm text-text-secondary mb-3 text-center">
            Track your physical progress by uploading progress photos.
          </p>
          <label 
            htmlFor="photo-upload-empty"
            className="bg-accent-violet text-neutral-900 text-sm font-medium px-4 py-2 rounded-lg flex items-center cursor-pointer hover:bg-accent-violet/90"
            data-testid="upload-first-photo"
          >
            Add First Photo
            <span className="ml-2 bg-black/10 rounded-full p-1 flex items-center justify-center">
              <Camera size={16} />
            </span>
            <input 
              id="photo-upload-empty"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        // Photo gallery
        <div>
          <div className="relative mb-3">
            <div className="w-full h-48 md:h-64 bg-background-surface rounded-lg overflow-hidden">
              <img 
                src={progressPhotos[activeIndex]?.url} 
                alt={`Progress photo ${activeIndex + 1}`} 
                className="w-full h-full object-cover"
                data-testid="active-photo"
              />
            </div>
            
            {/* Navigation arrows */}
            {progressPhotos.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  disabled={activeIndex === 0}
                  className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/10 rounded-full p-1 ${
                    activeIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                  }`}
                  aria-label="Previous photo"
                  data-testid="prev-photo"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={goToNext}
                  disabled={activeIndex === progressPhotos.length - 1}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/10 rounded-full p-1 ${
                    activeIndex === progressPhotos.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                  }`}
                  aria-label="Next photo"
                  data-testid="next-photo"
                >
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
          
          {/* Photo metadata */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center text-sm text-text-secondary">
              <Calendar size={14} className="mr-1" />
              {formatDate(progressPhotos[activeIndex]?.date)}
            </div>
            <div className="text-sm text-text-secondary">
              {activeIndex + 1} / {progressPhotos.length}
            </div>
          </div>
          
          {/* Photo description */}
          {progressPhotos[activeIndex]?.description && (
            <p className="text-sm bg-background-surface p-2 rounded-md mb-3">
              {progressPhotos[activeIndex].description}
            </p>
          )}
          
          {/* Delete button */}
          <div className="flex justify-end">
            <button 
              onClick={() => handleDeletePhoto(progressPhotos[activeIndex].id)}
              className="text-xs text-red-500 flex items-center hover:bg-red-500/10 p-1 rounded"
              data-testid="delete-photo"
            >
              <Trash size={14} className="mr-1" />
              Delete Photo
            </button>
          </div>
          
          {/* Thumbnail navigation for tablet/desktop */}
          {progressPhotos.length > 1 && (
            <div className="hidden md:flex mt-3 gap-2 overflow-x-auto py-1">
              {progressPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setActiveIndex(index)}
                  className={`relative min-w-[60px] h-16 rounded overflow-hidden ${
                    index === activeIndex ? 'ring-2 ring-accent-violet' : 'opacity-70'
                  }`}
                  aria-label={`View photo ${index + 1}`}
                  data-testid={`thumbnail-${index}`}
                >
                  <img 
                    src={photo.url} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoSlot;
