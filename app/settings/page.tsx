'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    description: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      description: user.description || '',
    });
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await apiClient.patch('/users/update-details', {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        description: formData.description,
      });

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!avatarFile) {
      setError('Please select an image file');
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('avatar', avatarFile);

      await apiClient.patch('/users/update-avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Avatar updated successfully');
      setAvatarFile(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !newPassword) {
      setError('Please fill in all password fields');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.patch('/users/change-password', {
        oldPassword: password,
        newPassword: newPassword,
      });

      setSuccess('Password changed successfully');
      setPassword('');
      setNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen py-8">
        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm">
              {success}
            </div>
          )}

          {/* Avatar Section */}
          <form onSubmit={handleUpdateAvatar} className="bg-secondary rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Avatar</h2>
            <div className="flex items-center gap-6">
              <Image
                src={user.avatar || '/default-avatar.png'}
                alt={user.username}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-muted-foreground cursor-pointer"
                />
              </div>
            </div>
            {avatarFile && (
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? 'Updating...' : 'Update Avatar'}
              </Button>
            )}
          </form>

          {/* Profile Information */}
          <form onSubmit={handleUpdateProfile} className="bg-secondary rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="bg-secondary rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Change Password</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>

          {/* Logout Button */}
          <Button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Logout
          </Button>
        </div>
      </main>
    </>
  );
}
