import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';
import { generateSignature } from '../lib/cloudinaryConfig';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<Profile>({
    id: user?.id || '',
    username: user?.username || '',
    full_name: user?.full_name || '',
    avatar_url: user?.avatar_url || ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  async function loadProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setAvatarPreview(data.avatar_url || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Error loading profile' });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setMessage({ type: 'error', text: 'Image size should be less than 2MB' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  async function uploadToCloudinary(file: File, resourceType: 'image' | 'video' | 'auto') {
    try {
      const timestamp = String(Math.round(new Date().getTime() / 1000));
      const signature = await generateSignature(timestamp);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp);
      formData.append('api_key', '752847587235562');
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dckv73izl/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return profile.avatar_url || null;

    try {
      // Upload to Cloudinary
      const avatarUrl = await uploadToCloudinary(avatarFile, 'image');
      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage(null);

      // Validate inputs
      if (!profile.username.trim() || !profile.full_name.trim()) {
        setMessage({ type: 'error', text: 'Username and full name are required' });
        return;
      }

      // Check if username is unique (excluding current user)
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', profile.username)
        .neq('id', user?.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingUser) {
        setMessage({ type: 'error', text: 'Username is already taken' });
        return;
      }

      // Upload new avatar if selected
      const newAvatarUrl = await uploadAvatar();

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: newAvatarUrl || profile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Error updating profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-primary">Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-text-primary">
            Profile Picture
          </label>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-accent/10">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-accent text-2xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="avatar" className="block text-sm font-medium text-text-primary">
                Upload Avatar
              </label>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-text-primary
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-accent file:text-white
                         hover:file:bg-accent/90"
              />
              <p className="mt-1 text-sm text-text-primary/60">
                JPG, PNG or GIF (max. 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-text-primary">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={profile.username}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-text-primary/10 
                     bg-bg-secondary text-text-primary shadow-sm
                     focus:border-accent focus:ring-accent sm:text-sm
                     px-4 py-2"
            required
          />
        </div>

        {/* Full Name Field */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-text-primary">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={profile.full_name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-text-primary/10 
                     bg-bg-secondary text-text-primary shadow-sm
                     focus:border-accent focus:ring-accent sm:text-sm
                     px-4 py-2"
            required
          />
        </div>

        {/* Email Display (non-editable) */}
        <div>
          <label className="block text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            aria-label="Email"
            disabled
            className="mt-1 block w-full rounded-md border border-text-primary/10
                     bg-bg-secondary/50 text-text-primary/70 shadow-sm
                     cursor-not-allowed sm:text-sm px-4 py-2"
          />
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent 
                     rounded-md shadow-sm text-sm font-medium text-bg-primary bg-accent 
                     hover:bg-accent/90 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-accent disabled:opacity-50
                     disabled:cursor-not-allowed dark:text-bg-primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
