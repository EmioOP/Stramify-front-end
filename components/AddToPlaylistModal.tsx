'use client';

// components/AddToPlaylistModal.tsx
// Usage: <AddToPlaylistModal videoId={video.id} onClose={() => setOpen(false)} />

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { X, Plus, Check, ListVideo, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Playlist {
  id: number;
  name: string;
}

interface Props {
  videoId: number | string;
  onClose: () => void;
}

export default function AddToPlaylistModal({ videoId, onClose }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('my_playlists');
    if (stored) setPlaylists(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const savePlaylists = (updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem('my_playlists', JSON.stringify(updated));
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    setError('');
    try {
      const response = await apiClient.post('/playlists', { name: newName.trim() });
      const newPlaylist: Playlist = {
        id: response.data.data?.id || Date.now(),
        name: newName.trim(),
      };
      console.log(response.data.data)
      savePlaylists([...playlists, newPlaylist]);
      setNewName('');
      setShowCreate(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAdd = async (playlistId: number) => {
    if (addedIds.has(playlistId)) return;
    setLoadingIds((prev) => new Set(prev).add(playlistId));
    try {
      await apiClient.post(`/playlists/${playlistId}/video/${videoId}`);
      setAddedIds((prev) => new Set(prev).add(playlistId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add video');
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(playlistId);
        return next;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Save to playlist</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Playlist List */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No playlists yet. Create one below!
            </p>
          ) : (
            playlists.map((pl) => {
              const isAdded = addedIds.has(pl.id);
              const isLoadingThis = loadingIds.has(pl.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => handleAdd(pl.id)}
                  disabled={isAdded || isLoadingThis}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors disabled:cursor-default"
                >
                  <span className="text-sm text-foreground">{pl.name}</span>
                  {isLoadingThis ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : isAdded ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Error */}
        {error && <p className="text-xs text-destructive px-5 pb-2">{error}</p>}

        {/* Create New */}
        <div className="border-t border-border px-5 py-4">
          {showCreate ? (
            <div className="flex gap-2">
              <Input
                placeholder="Playlist name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9 text-sm"
                autoFocus
              />
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newName.trim()}
                size="sm"
                className="bg-primary hover:bg-primary/90 shrink-0"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
              <Button
                onClick={() => { setShowCreate(false); setNewName(''); }}
                size="sm"
                variant="ghost"
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              New playlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
}