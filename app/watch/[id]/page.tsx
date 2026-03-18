'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, Share2, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import { ListVideo } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  videoFile: string;
  thumbnail: string;
  duration: number;
  views: number;
  owner: {
    id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  isLiked?: boolean;
  likesCount?: number;
}

interface Comment {
  _id: string;
  content: string;
  owner: {
    _id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

export default function WatchPage() {
  const params = useParams();
  const videoId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [videoRes, commentsRes] = await Promise.all([
          apiClient.get(`/videos/${videoId}`),
          apiClient.get(`/comments/${videoId}`),
        ]);



        setVideo(videoRes.data.data);
        setComments(commentsRes.data.data || []);
        setIsLiked(videoRes.data.data.isLiked || false);

        // Increment view count
        await apiClient.post(`/videos/${videoId}/view`);
      } catch (error) {
        console.error('Failed to load video:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchData();
    }
  }, [videoId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like videos');
      return;
    }

    try {
      await apiClient.post(`/likes/like/${videoId}`);
      setIsLiked(!isLiked);
      if (video) {
        setVideo({
          ...video,
          likesCount: (video.likesCount || 0) + (isLiked ? -1 : 1),
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setIsSubmittingComment(true);
      const response = await apiClient.post(`/comments/comment/${videoId}`, {
        content: commentText,
      });

      setComments([response.data.data, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="aspect-video bg-secondary rounded-lg animate-pulse mb-6" />
          </div>
        </main>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Video not found</h2>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen py-8">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player and Info */}
            <div className="lg:col-span-2">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <video
                  src={video.videoFile}
                  controls
                  className="w-full h-full"
                  poster={video.thumbnail}
                />
              </div>

              {/* Video Title */}
              <h1 className="text-2xl font-bold text-foreground mb-4">{video.title}</h1>

              {/* Video Stats and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <Link href={`/channel/${video.owner.id}`}>
                    <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <Image
                        src={video.avatar || '/default-avatar.png'}
                        alt={video.fullName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{video.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleLike}
                    className={
                      isLiked
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border hover:bg-secondary'
                    }
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {video.likesCount || 0}
                  </Button>

                  <button onClick={() => setShowPlaylist(true)}>
                    <ListVideo className="w-5 h-5" /> Save
                  </button>

                  {showPlaylist && (
                    <AddToPlaylistModal videoId={video.id} onClose={() => setShowPlaylist(false)} />
                  )}

                  <Button variant="outline" size="sm" className="border-border hover:bg-secondary">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Video Description */}
              <div className="bg-secondary rounded-lg p-4 mb-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {video.views.toLocaleString()} views
                </p>
                <p className="text-foreground whitespace-pre-wrap">{video.description}</p>
              </div>

              {/* Comments Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Comments</h2>

                {/* Comment Form */}
                {isAuthenticated && user ? (
                  <form onSubmit={handleCommentSubmit} className="flex gap-4">
                    <Image
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.username}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Input
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground mb-3"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCommentText('')}
                          className="border-border hover:bg-secondary"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingComment || !commentText.trim()}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {isSubmittingComment ? 'Posting...' : 'Comment'}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <p className="text-muted-foreground">
                    <Link href="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>{' '}
                    to comment
                  </p>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Image
                          src={comment.avatar}
                          alt={comment.username}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {comment.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {comment.createdAt && !isNaN(new Date(comment.createdAt).getTime()) ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : "Just Now"}
                            </p>
                          </div>
                          <p className="text-foreground mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No comments yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Recommended Videos */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-foreground mb-4">Recommended</h3>
              <div className="space-y-4">
                {/* Placeholder for recommended videos */}
                <p className="text-sm text-muted-foreground">More videos coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
