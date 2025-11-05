import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  X, 
  Check, 
  RotateCcw,
  Upload,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const hasOpenedCamera = useRef(false);

  const processImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        // Create canvas for cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Set output size
        const outputSize = 512;
        canvas.width = outputSize;
        canvas.height = outputSize;
        
        // Calculate crop dimensions (center square crop)
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;
        
        // Draw cropped and resized image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize, // Source rectangle
          0, 0, outputSize, outputSize // Destination rectangle
        );
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file with same name
            const processedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to process image'));
          }
        }, 'image/jpeg', 0.9); // 90% quality
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Process image to 512x512
        const processedFile = await processImage(file);
        setCapturedFile(processedFile);
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to original file
        setCapturedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [processImage]);

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      handleClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    cameraInputRef.current?.click();
  };

  const handleClose = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    hasOpenedCamera.current = false;
    onClose();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  // Automatically open camera when component opens
  useEffect(() => {
    if (isOpen && !hasOpenedCamera.current && !capturedImage) {
      hasOpenedCamera.current = true;
      // Small delay to ensure the modal is fully rendered
      setTimeout(() => {
        openCamera();
      }, 100);
    }
  }, [isOpen, capturedImage]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Main Content */}
            <div className="bg-dark-bg/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
              {/* Only show header when image is captured */}
              {capturedImage && (
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-lime/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-accent-lime" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Review Your Photo</h3>
                      <p className="text-xs text-white/60">AI will analyze your food</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {/* Camera/Preview Area */}
              {capturedImage && (
                <div className="relative aspect-square bg-black">
                  {/* Image Preview */}
                  <img
                    src={capturedImage}
                    alt="Captured meal"
                    className="w-full h-full object-cover"
                  />
                  {/* Info text */}
                  <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                      512×512px • Center crop
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {capturedImage ? (
                <div className="p-6">
                  <div className="flex gap-3">
                    <button
                      onClick={handleRetake}
                      className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retake
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-accent-lime to-accent-orange hover:shadow-lg hover:shadow-accent-lime/25 text-dark-bg font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Use This Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative p-8 text-center">
                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  
                  <div className="w-16 h-16 rounded-full bg-accent-lime/20 mx-auto mb-4 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-accent-lime" />
                  </div>
                  <p className="text-white font-medium mb-2">Opening camera...</p>
                  <p className="text-sm text-white/60 mb-6">Take a photo of your meal</p>
                  
                  {/* Gallery option as a subtle link */}
                  <button
                    onClick={openGallery}
                    className="text-accent-lime text-sm hover:underline"
                  >
                    or choose from gallery
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}