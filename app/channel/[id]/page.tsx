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
  id: string;
  title: string;
  description: string;
  videoFile: string;
  thumbnail: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: {
    id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

interface Playlist {
  id: number;
  owner_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface EditVideoForm {
  title: string;
  description: string;
  isPublished: boolean;
}

type Tab = 'videos' | 'playlists';

export default function ChannelPage() {
  const { user, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsLoaded, setPlaylistsLoaded] = useState(false);

  // Edit modal state
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editForm, setEditForm] = useState<EditVideoForm>({
    title: '',
    description: '',
    isPublished: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

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

  const fetchPlaylists = async () => {
    if (playlistsLoaded || !user?.id) return;
    try {
      setPlaylistsLoading(true);
      const res = await apiClient.get(`/playlists?owner=${user.id}`);
      setPlaylists(res.data.data || []);
      setPlaylistsLoaded(true);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'playlists') fetchPlaylists();
  };

  const openEditModal = (video: Video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description,
      isPublished: video.isPublished,
    });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingVideo(null);
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editingVideo) return;
    if (!editForm.title.trim()) {
      setEditError('Title is required.');
      return;
    }
    try {
      setIsSaving(true);
      await apiClient.patch(`/videos/${editingVideo.id}`, editForm);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === editingVideo.id ? { ...v, ...editForm } : v
        )
      );
      closeEditModal();
    } catch (error) {
      console.error('Failed to update video:', error);
      setEditError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
        {/* Cover */}
        <div className="w-full h-48 bg-gradient-to-r from-primary/20 to-accent/20" />

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div className="flex items-end gap-6">
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

            {/* Tabs */}
            <div className="border-b border-border mb-8">
              <nav className="flex gap-1" aria-label="Channel tabs">
                {(['videos', 'playlists'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div>
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {videos.map((video) => (
                      <div key={video.id} className="group relative">
                        <VideoCard
                          id={video.id}
                          title={video.title}
                          thumbnail={video.thumbnail}
                          avatar={video.avatar}
                          owner={video.owner}
                          duration={video.duration}
                          views={video.views}
                          createdAt={video.createdAt}
                        />
                        {/* Edit overlay button */}
                        <button
                          onClick={() => openEditModal(video)}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Edit
                        </button>
                        {/* Published badge */}
                        <span
                          className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded font-medium ${
                            video.isPublished
                              ? 'bg-green-500/80 text-white'
                              : 'bg-yellow-500/80 text-white'
                          }`}
                        >
                          {video.isPublished ? 'Published' : 'Private'}
                        </span>
                      </div>
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
            )}

            {/* Playlists Tab */}
            {activeTab === 'playlists' && (
              <div>
                {playlistsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="aspect-video bg-secondary animate-pulse rounded-lg" />
                        <div className="h-4 w-3/4 bg-secondary animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-secondary animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : playlists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {playlists.map((playlist) => (
                      <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                        <div className="group cursor-pointer border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                          {/* Placeholder thumbnail */}
                          <div className="aspect-video bg-secondary flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                              <path d="M21 15V6" /><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                              <path d="M12 12H3" /><path d="M16 6H3" /><path d="M12 18H3" />
                            </svg>
                          </div>
                          <div className="px-3 py-2.5">
                            <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                              {playlist.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(playlist.created_at).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground mb-4">
                      You haven't created any playlists yet
                    </p>
                    <Button variant="outline">Create a playlist</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeEditModal()}
        >
          <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Edit video details</h2>
              <button
                onClick={closeEditModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Thumbnail preview */}
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-secondary relative">
                {editingVideo.thumbnail && (
                  <Image
                    src={editingVideo.thumbnail}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="edit-title">
                  Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Enter video title"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {editForm.title.length}/200
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="edit-desc">
                  Description
                </label>
                <textarea
                  id="edit-desc"
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="Describe your video"
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {editForm.description.length}/2000
                </p>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Visibility</p>
                  <p className="text-xs text-muted-foreground">
                    {editForm.isPublished ? 'Public — anyone can watch' : 'Private — only you can watch'}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={editForm.isPublished}
                  onClick={() => setEditForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    editForm.isPublished ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      editForm.isPublished ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {editError && (
                <p className="text-sm text-red-500">{editError}</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <Button variant="ghost" onClick={closeEditModal} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}