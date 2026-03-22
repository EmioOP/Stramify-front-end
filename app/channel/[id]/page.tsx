'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

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

export default function ChannelPage() {
  const { user, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const videosRes = await apiClient.get(`/videos?owner=${user.id}`);
        setVideos(videosRes.data.data || []);
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Please login to view your channel
            </h2>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen">
          {/* Cover placeholder shimmer */}
          <div className="w-full h-48 bg-secondary animate-pulse" />
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end gap-6">
                <div className="w-24 h-24 rounded-full bg-secondary animate-pulse -mt-12 border-4 border-background" />
                <div className="space-y-2 pb-1">
                  <div className="h-7 w-48 bg-secondary animate-pulse rounded" />
                  <div className="h-4 w-32 bg-secondary animate-pulse rounded" />
                </div>
              </div>
              {/* Video grid shimmer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-video bg-secondary animate-pulse rounded-lg" />
                    <div className="h-4 w-3/4 bg-secondary animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-secondary animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        {/* Cover — gradient only since no coverImage column in DB */}
        <div className="w-full h-48 bg-gradient-to-r from-primary/20 to-accent/20" />

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div className="flex items-end gap-6">
                {/* Avatar — pulled up over the cover */}
                <div className="w-24 h-24 rounded-full bg-primary/20 overflow-hidden -mt-16 border-4 border-background flex-shrink-0">
                  <Image
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.username || 'avatar'}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{user?.fullName}</h1>
                  <p className="text-muted-foreground">@{user?.username}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                  </p>
                </div>
              </div>

              <Link href="/settings">
                <Button variant="secondary">Edit Channel</Button>
              </Link>
            </div>

            {/* Videos Grid */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Videos</h2>
              {videos.length > 0 ? (
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
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground mb-4">
                    You haven't uploaded any videos yet
                  </p>
                  <Link href="/upload">
                    <Button>Upload your first video</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}