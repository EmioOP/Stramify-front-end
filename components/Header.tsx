'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Upload, LogOut, User, Settings } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-primary">APERTURE</h1>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md">
          <div className="flex-1 flex items-center bg-secondary border border-border rounded-full px-4">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground py-2"
            />
            <button type="submit" className="p-2 hover:bg-muted rounded-full transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && user ? (
            <>
              <Link href="/upload">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary"
                  title="Upload video"
                >
                  <Upload className="w-5 h-5" />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full overflow-hidden hover:bg-secondary"
                  >
                    <Image
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user._id}`} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>My Channel</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-border hover:bg-secondary">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
