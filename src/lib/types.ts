export type UserRole = 'admin' | 'user';
export type PostStatus = 'draft' | 'published' | 'archived';
export type MediaType = 'image' | 'audio';
export type BlogCategory = 'Technology' | 'Lifestyle' | 'Food' | 'Travel' | 'Society' | 'Finance' | 'Anime' | 'Movies' | 'Health' | 'Science' | 'Education' | 'Sports' | 'Business' | 'Art' | 'Music' | 'Other' | 'Gaming' | 'Parenting' | 'Books' | 'Environment' | 'History';

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  role: 'user' | 'admin';
  user_metadata?: {
    username?: string;
    full_name?: string;
  };
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  featured_image?: string;
  audio_url?: string;
  published: boolean;
  created_at: string;
  author_id: string;
  author?: Profile;
  category?: string;
  category_ml?: BlogCategory;
}

export interface Media {
  id: string;
  url: string;
  type: MediaType;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user: Profile;
  reported?: boolean;
  report_reason?: string;
}