'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Upload as UploadIcon } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isAuthenticated || !user) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Sign in to upload videos
            </h2>
            <Button onClick={() => router.push('/login')} className="bg-primary hover:bg-primary/90">
              Go to Login
            </Button>
          </div>
        </main>
      </>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Client-side validation mirrors backend requirements
      if (!formData.title.trim()) {
        setError('Title is required');
        setIsLoading(false);
        return;
      }

      // Description is required by the backend
      if (!formData.description.trim()) {
        setError('Description is required');
        setIsLoading(false);
        return;
      }

      if (!videoFile) {
        setError('Please select a video file');
        setIsLoading(false);
        return;
      }

      if (!thumbnailFile) {
        setError('Please select a thumbnail image');
        setIsLoading(false);
        return;
      }

      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      // Field names match backend: req.files?.videoFile and req.files?.thumbnail
      data.append('videoFile', videoFile);
      data.append('thumbnail', thumbnailFile);

      const response = await apiClient.post('/videos/video', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        },
      });

      // Backend returns: new ApiResponse(201, videoUploaded, "video uploaded successfully")
      // So response.data = { statusCode, data: videoUploaded, message }
      router.push(`/watch/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen py-8">
        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Upload Video</h1>
            <p className="text-muted-foreground">Share your content with the world</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Video Title <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                name="title"
                placeholder="Enter video title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Description — required by backend */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Describe your video"
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                rows={4}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Video File */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Video File <span className="text-destructive">*</span>
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={isLoading}
                  className="hidden"
                  id="video-input"
                />
                <label htmlFor="video-input" className="cursor-pointer block">
                  <UploadIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-foreground mb-1">
                    {videoFile ? videoFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-muted-foreground">MP4, WebM or Ogg up to 4GB</p>
                </label>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Thumbnail Image <span className="text-destructive">*</span>
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={isLoading}
                  className="hidden"
                  id="thumbnail-input"
                />
                <label htmlFor="thumbnail-input" className="cursor-pointer block">
                  <UploadIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-foreground mb-1">
                    {thumbnailFile ? thumbnailFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-muted-foreground">JPG, PNG or WebP</p>
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {isLoading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">Uploading...</span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
            >
              {isLoading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}