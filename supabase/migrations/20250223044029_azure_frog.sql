/*
  # Initial Blog Application Schema

  1. New Tables
    - users (extends Supabase auth.users)
      - id (uuid, primary key)
      - username (text, unique)
      - full_name (text)
      - avatar_url (text)
      - role (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - posts
      - id (uuid, primary key)
      - title (text)
      - content (text)
      - excerpt (text)
      - status (text)
      - author_id (uuid, foreign key)
      - created_at (timestamp)
      - updated_at (timestamp)
      - published_at (timestamp)
    
    - media
      - id (uuid, primary key)
      - url (text)
      - type (text)
      - user_id (uuid, foreign key)
      - created_at (timestamp)
    
    - comments
      - id (uuid, primary key)
      - content (text)
      - post_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Special policies for admin users
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE media_type AS ENUM ('image', 'audio');

-- Create users table with role-based access control
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role user_role DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  featured_image text,
  audio_url text,
  published boolean DEFAULT false,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  type media_type NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON users FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update all profiles"
  ON users FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Posts policies
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Users can view their own posts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- Media policies
CREATE POLICY "Users can view own media"
  ON media FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own media"
  ON media FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own comments"
  ON comments FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger after auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create view for all posts with author information
CREATE OR REPLACE VIEW public.posts_with_authors AS
SELECT 
    p.*,
    u.email as author_email,
    u.role as author_role
FROM posts p
JOIN users u ON p.author_id = u.id;

-- Function to get all posts (admin view)
CREATE OR REPLACE FUNCTION get_all_posts()
RETURNS SETOF posts_with_authors
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (SELECT role FROM users WHERE id = auth.uid()) = 'admin' THEN
    RETURN QUERY SELECT * FROM posts_with_authors ORDER BY created_at DESC;
  ELSE
    RETURN QUERY SELECT * FROM posts_with_authors WHERE published = true OR author_id = auth.uid() ORDER BY created_at DESC;
  END IF;
END;
$$;

-- Function to get a single post by ID
CREATE OR REPLACE FUNCTION get_post_by_id(post_id uuid)
RETURNS SETOF posts_with_authors
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (SELECT role FROM users WHERE id = auth.uid()) = 'admin' THEN
    RETURN QUERY SELECT * FROM posts_with_authors WHERE id = post_id;
  ELSE
    RETURN QUERY SELECT * FROM posts_with_authors 
    WHERE id = post_id AND (published = true OR author_id = auth.uid());
  END IF;
END;
$$;

-- Function to update a post
CREATE OR REPLACE FUNCTION update_post(
  post_id uuid,
  new_title text DEFAULT NULL,
  new_content text DEFAULT NULL,
  new_featured_image text DEFAULT NULL,
  new_published boolean DEFAULT NULL
)
RETURNS posts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_post posts;
BEGIN
  -- Check if user is admin or post owner
  IF NOT EXISTS (
    SELECT 1 FROM posts p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id = post_id 
    AND (u.role = 'admin' OR p.author_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Unauthorized to update this post';
  END IF;

  UPDATE posts SET
    title = COALESCE(new_title, title),
    content = COALESCE(new_content, content),
    featured_image = COALESCE(new_featured_image, featured_image),
    published = COALESCE(new_published, published),
    updated_at = now()
  WHERE id = post_id
  RETURNING * INTO updated_post;

  RETURN updated_post;
END;
$$;

-- Function to delete a post
CREATE OR REPLACE FUNCTION delete_post(post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin or post owner
  IF NOT EXISTS (
    SELECT 1 FROM posts p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id = post_id 
    AND (u.role = 'admin' OR p.author_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Unauthorized to delete this post';
  END IF;

  DELETE FROM posts WHERE id = post_id;
  RETURN true;
END;
$$;