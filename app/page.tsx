'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import apiClient from '@/lib/api';

interface Video {
  id: string;
  title: string;
  description: string;
  videoFile: string;
  thumbnail: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/videos', {
          params: { page, limit: 20 },
        });
        setVideos(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load videos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [page]);

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Discover Videos</h2>
            <p className="text-muted-foreground">Explore amazing content from creators</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-secondary rounded-lg mb-3" />
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    avatar={video.avatar}
                    duration={video.duration}
                    views={video.views}
                    createdAt={video.createdAt}
                    owner={video.owner}
                    
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-6 py-2 text-muted-foreground">Page {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No videos found</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
