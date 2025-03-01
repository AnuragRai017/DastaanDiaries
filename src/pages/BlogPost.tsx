import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Post as BlogPostType } from '../lib/types';
import LoadingSpinner from '../components/LoadingSpinner';
import DOMPurify from 'dompurify';
import { useAuth } from '../contexts/AuthContext';
import CommentList from '../components/CommentList';
import { BlogCategory } from '../lib/types';
import { getCategoryColor, categorizeContent } from '../lib/categoryService';

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string;
  audio_url: string;
  published: boolean;
  created_at: string;
  author_id: string;
  category?: string;
  category_ml?: BlogCategory;
  author: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only attempt to fetch the post if we have a valid ID
    if (id && id !== 'undefined') {
      fetchPost();
    } else {
      setLoading(false);
      setError("No post ID provided");
    }
  }, [id]);

  async function fetchPost() {
    try {
      // First fetch the post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postError) throw postError;

      // Only allow viewing if post is published or user is the author
      if (!post.published && (!user || (user.id !== post.author_id))) {
        setPost(null);
        return;
      }

      // Then fetch the author's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', post.author_id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Apply ML categorization if category_ml is not set
      if (!post.category_ml) {
        post.category_ml = categorizeContent(post.content);
      }

      // Combine post with author profile
      const postWithAuthor = {
        ...post,
        author: profile || { 
          username: 'Unknown',
          full_name: 'Unknown User',
          avatar_url: ''
        }
      };

      setPost(postWithAuthor);
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(null);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Post not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || "The post you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/blog"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Post Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/blog"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
            {!post.published && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-full text-sm font-medium">
                Draft
              </span>
            )}
            {post.category_ml && (
              <span 
                className="px-3 py-1 text-sm rounded-md text-white font-medium"
                style={{ backgroundColor: getCategoryColor(post.category_ml) }}
              >
                {post.category_ml}
              </span>
            )}
          </div>

          {post.featured_image && (
            <div className="aspect-w-16 aspect-h-9 mb-8 rounded-lg overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span>By {post.author?.username || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>

        {/* Audio Player */}
        {post.audio_url && (
          <div className="mb-8">
            <audio
              controls
              className="w-full"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '0.5rem',
                padding: '0.5rem'
              }}
            >
              <source src={post.audio_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Post Content */}
        <div 
          className="prose prose-lg dark:prose-invert mx-auto"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
        
        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Comments</h2>
          <CommentList postId={post.id} />
        </div>
      </article>
    </div>
  );
}