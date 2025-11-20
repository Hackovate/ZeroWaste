'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, X, Trash2, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface ScannedImage {
  id: string;
  imageData: string;
  timestamp: string;
  fileName: string;
}

const STORAGE_KEY = 'foodScans';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const FoodScanning: React.FC = () => {
  const [scannedImages, setScannedImages] = useState<ScannedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images from localStorage on mount
  useEffect(() => {
    loadImagesFromStorage();
  }, []);

  const loadImagesFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const images = JSON.parse(stored) as ScannedImage[];
        // Sort by timestamp (newest first)
        const sorted = images.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setScannedImages(sorted);
      }
    } catch (error) {
      console.error('Failed to load images from storage:', error);
      toast.error('Failed to load scanned images');
    }
  };

  const saveImagesToStorage = (images: ScannedImage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Failed to save images to storage:', error);
      toast.error('Failed to save image. Storage may be full.');
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newImages: ScannedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        try {
          const imageData = await convertFileToBase64(file);
          const newImage: ScannedImage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            imageData,
            timestamp: new Date().toISOString(),
            fileName: file.name,
          };
          newImages.push(newImage);
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`);
        }
      }

      if (newImages.length > 0) {
        const updatedImages = [...newImages, ...scannedImages];
        setScannedImages(updatedImages);
        saveImagesToStorage(updatedImages);
        toast.success(`Successfully uploaded ${newImages.length} image(s)`);
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteImage = (id: string) => {
    const updatedImages = scannedImages.filter(img => img.id !== id);
    setScannedImages(updatedImages);
    saveImagesToStorage(updatedImages);
    toast.success('Image deleted');
  };

  const handleClearAll = () => {
    if (scannedImages.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete all ${scannedImages.length} scanned images?`)) {
      setScannedImages([]);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('All images deleted');
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1>Food Scanner</h1>
        <p className="text-[var(--color-700)] mt-1">
          Upload and store food images locally in your browser
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Food Images</CardTitle>
          <CardDescription>
            Drag and drop images here or click to browse. Maximum file size: 5MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-[var(--color-300)] hover:border-primary/50'
              }
              ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-sm text-[var(--color-700)]">Uploading images...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-900)]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-[var(--color-700)] mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                  <Button type="button" variant="outline" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Select Images
                  </Button>
                </>
              )}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Scanned Images ({scannedImages.length})
          </h2>
          <p className="text-sm text-[var(--color-700)]">
            Images stored locally in your browser
          </p>
        </div>
        {scannedImages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {scannedImages.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-300)]/30 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-[var(--color-700)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No images scanned yet</h3>
              <p className="text-sm text-[var(--color-700)] mb-4">
                Upload your first food image to get started
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scannedImages.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-muted">
                <ImageWithFallback
                  src={image.imageData}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleDeleteImage(image.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium truncate mb-1" title={image.fileName}>
                  {image.fileName}
                </p>
                <p className="text-xs text-[var(--color-700)]">
                  {formatDate(image.timestamp)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

