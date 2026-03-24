'use client';

// app/playlist/[id]/page.tsx

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import apiClient from '@/lib/api';
import { Trash2, X, Play, ListVideo, Loader2, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaylistVideo {
  id: number;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  createdAt: string;
  playlist_video_id: number;
  position: number;
  owner_username: string;
  owner_avatar: string;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(views: number) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

export default function PlaylistPage() {
  const { id } = useParams();
  const router = useRouter();

  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playlistName, setPlaylistName] = useState<string | null>(null);

  useEffect(() => {
    const playlists: { id: number; name: string }[] = JSON.parse(
      localStorage.getItem('my_playlists') || '[]'
    );
    const found = playlists.find((p) => String(p.id) === String(id));
    setPlaylistName(found?.name ?? null);
  }, [id]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/playlists/${id}`);
        setVideos(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load playlist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [id]);

  const handleRemove = async (videoId: number) => {
    setRemovingId(videoId);
    try {
      await apiClient.delete(`/playlists/${id}/video/${videoId}`);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove video');
    } finally {
      setRemovingId(null);
    }
  };

const handleDelete = async () => {
  if (!confirm('Delete this playlist?')) return;
  setIsDeleting(true);
  try {
    await apiClient.delete(`/playlists/${id}`);
    const playlists: { id: number; name: string }[] = JSON.parse(
      localStorage.getItem('my_playlists') || '[]'
    );
    const updated = playlists.filter((p) => String(p.id) !== String(id));
    localStorage.setItem('my_playlists', JSON.stringify(updated));
    router.push('/playlists');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to delete playlist');
    setIsDeleting(false);
  }
};

  const totalDuration = videos.reduce((acc, v) => acc + v.duration, 0);
  const totalViews = videos.reduce((acc, v) => acc + v.views, 0);

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Playlist Header */}
          <div className="flex items-start justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ListVideo className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {playlistName ?? `Playlist #${id}`}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Play className="w-3.5 h-3.5" />
                    {videos.length} videos
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(totalDuration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {formatViews(totalViews)} views
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">Delete playlist</span>
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-8" />
                  <div className="aspect-video w-40 bg-secondary rounded-lg shrink-0" />
                  <div className="flex-1 pt-2">
                    <div className="h-4 bg-secondary rounded mb-2 w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <ListVideo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">This playlist is empty</p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 mt-4">Browse videos</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map((video, index) => (
                <div
                  key={video.playlist_video_id}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  {/* Position */}
                  <span className="w-6 text-center text-sm text-muted-foreground shrink-0">
                    {index + 1}
                  </span>

                  {/* Thumbnail */}
                  <Link href={`/video/${video.id}`} className="shrink-0">
                    <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-secondary">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/video/${video.id}`}>
                      <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {video.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {video.owner_avatar && (
                        <Image
                          src={video.owner_avatar}
                          alt={video.owner_username}
                          width={16}
                          height={16}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">{video.owner_username}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatViews(video.views)} views</span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(video.id)}
                    disabled={removingId === video.id}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0"
                    title="Remove from playlist"
                  >
                    {removingId === video.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}