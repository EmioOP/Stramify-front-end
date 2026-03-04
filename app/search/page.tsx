'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import apiClient from '@/lib/api';

interface Video {
  _id: string;
  title: string;
  description: string;
  videoFile: string;
  thumbnail: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: {
    _id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get('/videos', {
          params: { search: query },
        });
        setVideos(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load search results');
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Search results for <span className="text-primary">"{query}"</span>
              </h2>
              <p className="text-muted-foreground">
                {isLoading ? 'Loading...' : `Found ${videos.length} ${videos.length === 1 ? 'video' : 'videos'}`}
              </p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video._id}
                    id={video._id}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    owner={video.owner}
                    duration={video.duration}
                    views={video.views}
                    createdAt={video.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No videos found for your search</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
