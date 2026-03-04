'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface ChannelInfo {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  description?: string;
  subscribersCount: number;
  channelSubscribedToCount: number;
  isSubscribed: boolean;
  createdAt: string;
}

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
  const params = useParams();
  const channelId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const isOwnChannel = isAuthenticated && user?._id === channelId;

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setIsLoading(true);
        const [channelRes, videosRes] = await Promise.all([
          apiClient.get(`/users/${channelId}`),
          apiClient.get(`/videos?owner=${channelId}`),
        ]);

        setChannel(channelRes.data.data);
        setVideos(videosRes.data.data || []);
        setIsSubscribed(channelRes.data.data.isSubscribed || false);
      } catch (error) {
        console.error('Failed to load channel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (channelId) {
      fetchChannelData();
    }
  }, [channelId]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      alert('Please login to subscribe');
      return;
    }

    try {
      // Toggle subscription endpoint would need to be added to backend
      setIsSubscribed(!isSubscribed);
      if (channel) {
        setChannel({
          ...channel,
          subscribersCount: channel.subscribersCount + (isSubscribed ? -1 : 1),
        });
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen">
          <div className="w-full h-48 bg-secondary animate-pulse" />
        </main>
      </>
    );
  }

  if (!channel) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Channel not found</h2>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        {/* Cover Image */}
        <div className="w-full h-48 bg-gradient-to-r from-primary/20 to-accent/20 overflow-hidden">
          {channel.coverImage && (
            <Image
              src={channel.coverImage}
              alt="Channel cover"
              width={1200}
              height={200}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Channel Info */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div className="flex items-end gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 overflow-hidden -mt-16 border-4 border-background">
                  <Image
                    src={channel.avatar || '/default-avatar.png'}
                    alt={channel.username}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{channel.fullName}</h1>
                  <p className="text-muted-foreground">@{channel.username}</p>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{channel.subscribersCount.toLocaleString()} subscribers</span>
                    <span>•</span>
                    <span>{videos.length} videos</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnChannel ? (
                  <Link href="/settings">
                    <Button className="bg-secondary text-foreground hover:bg-secondary/80">
                      Edit Channel
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleSubscribe}
                    className={
                      isSubscribed
                        ? 'bg-secondary text-foreground hover:bg-secondary/80'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            {channel.description && (
              <div className="mb-12 bg-secondary rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap">{channel.description}</p>
              </div>
            )}

            {/* Videos Grid */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Videos</h2>
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
                <p className="text-muted-foreground text-center py-12">No videos uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
