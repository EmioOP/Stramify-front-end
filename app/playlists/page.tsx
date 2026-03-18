'use client';

// app/playlists/page.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { ListVideo, Plus, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Playlist {
  id: number;
  name: string;
}

export default function PlaylistsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    const stored = localStorage.getItem('my_playlists');
    if (stored) setPlaylists(JSON.parse(stored));
  }, []);

  const save = (updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem('my_playlists', JSON.stringify(updated));
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    setError('');
    try {
      const response = await apiClient.post('/playlists', { name: newName.trim() });
      const newPl: Playlist = {
        id: response.data.data?.id || Date.now(),
        name: newName.trim(),
      };
      save([...playlists, newPl]);
      setNewName('');
      setShowCreate(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (pl: Playlist) => {
    if (!confirm(`Delete "${pl.name}"?`)) return;
    setDeletingId(pl.id);
    try {
      await apiClient.delete(`/playlists/${pl.id}`);
      save(playlists.filter((p) => p.id !== pl.id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete playlist');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Playlists</h1>
              <p className="text-muted-foreground mt-1">
                {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New playlist
            </Button>
          </div>

          {/* Create form */}
          {showCreate && (
            <div className="mb-6 p-4 bg-secondary rounded-xl border border-border flex gap-3 items-center">
              <Input
                placeholder="Playlist name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newName.trim()}
                className="bg-primary hover:bg-primary/90 shrink-0"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowCreate(false); setNewName(''); }}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Playlists */}
          {playlists.length === 0 ? (
            <div className="text-center py-16">
              <ListVideo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">No playlists yet</p>
              <p className="text-muted-foreground text-sm">Create one to start saving videos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="group flex items-center justify-between p-4 bg-secondary rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <Link
                    href={`/playlist/${pl.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ListVideo className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {pl.name}
                    </span>
                  </Link>

                  <button
                    onClick={() => handleDelete(pl)}
                    disabled={deletingId === pl.id}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all ml-3 shrink-0"
                  >
                    {deletingId === pl.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
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