import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BlogCard from '../components/BlogCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import DOMPurify from 'dompurify';
import { BlogCategory } from '../lib/types';
import { getAllCategories, getCategoryColor, categorizeContent } from '../lib/categoryService';
import CategoryDropdown from '../components/CategoryDropdown';

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string;
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

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const allCategories = getAllCategories();

  useEffect(() => {
    fetchPosts();
  }, [user, filter]);

  async function fetchPosts() {
    setLoading(true);
    try {
      // First fetch all posts
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is logged in, show published posts and their own drafts
      if (user) {
        query = query.or(`published.eq.true,and(author_id.eq.${user.id},published.eq.false)`);
      } else {
        query = query.eq('published', true);
      }

      const { data: posts, error: postsError } = await query;
      if (postsError) throw postsError;

      // Then fetch all unique authors
      const authorIds = [...new Set(posts?.map(post => post.author_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', authorIds);
      if (profilesError) throw profilesError;

      // Map profiles to posts
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]));
      // Filter out posts with undefined ids
      const validPosts = (posts || []).filter(post => post.id);
      const postsWithAuthors = validPosts.map(post => {
        // Apply ML categorization if category_ml is not set
        if (!post.category_ml) {
          post.category_ml = categorizeContent(post.content);
        }
        
        return {
          ...post,
          author: profileMap.get(post.author_id) || { 
            username: 'Unknown',
            full_name: 'Unknown User',
            avatar_url: ''
          }
        };
      }) || [];

      setPosts(postsWithAuthors);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }

  function getExcerpt(content: string) {
    const sanitizedContent = DOMPurify.sanitize(content);
    const plainText = sanitizedContent.replace(/<[^>]+>/g, '').trim();
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }

  // Filter posts by category and date
  const filteredPosts = posts.filter(post => {
    // Filter by status (all, published, drafts)
    if (filter === 'published' && !post.published) return false;
    if (filter === 'drafts' && (post.published || post.author_id !== user?.id)) return false;
    
    // Filter by category if selected
    if (categoryFilter && post.category_ml !== categoryFilter) return false;
    
    // Filter by date if selected
    if (dateFilter) {
      const postDate = new Date(post.created_at).toISOString().split('T')[0];
      if (postDate !== dateFilter) return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary animate-pulse">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-6 text-white">Blog Posts</h1>
        
        {/* Status filters */}
        {user && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-[#e50914] text-white font-medium'
                  : 'bg-white/10 text-white hover:bg-[#e50914]/80 hover:text-white font-medium border border-[#e50914]/20'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === 'published'
                  ? 'bg-[#e50914] text-white font-medium'
                  : 'bg-white/10 text-white hover:bg-[#e50914]/80 hover:text-white font-medium border border-[#e50914]/20'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('drafts')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === 'drafts'
                  ? 'bg-[#e50914] text-white font-medium'
                  : 'bg-white/10 text-white hover:bg-[#e50914]/80 hover:text-white font-medium border border-[#e50914]/20'
              }`}
            >
              My Drafts
            </button>
          </div>
        )}
        
        {/* Advanced filters toggle */}
        <div className="w-full max-w-3xl mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-[#e50914] hover:text-[#e50914]/80 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-[#141414] border border-white/20 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="categoryFilter" className="block text-sm font-medium text-white mb-1">
                    Filter by Category
                  </label>
                  <CategoryDropdown
                    categories={allCategories}
                    selectedCategory={categoryFilter}
                    onChange={setCategoryFilter}
                    placeholder="All Categories"
                  />
                </div>
                
                <div>
                  <label htmlFor="dateFilter" className="block text-sm font-medium text-white mb-1">
                    Filter by Date
                  </label>
                  <input
                    id="dateFilter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full p-2 rounded-md bg-[#1f1f1f] border border-white/20 text-white focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setDateFilter('');
                  }}
                  className="px-3 py-1 text-sm bg-[#e50914]/10 text-[#e50914] rounded-md hover:bg-[#e50914]/20 transition-all duration-200 border border-[#e50914]/30"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        <Link
          to="/dashboard/new"
          className="inline-flex items-center px-4 py-2 bg-[#e50914] text-white rounded-lg hover:bg-opacity-80 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Post
        </Link>
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">No posts found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="transition-transform duration-200">
              <BlogCard
                id={post.id}
                title={post.title}
                excerpt={getExcerpt(post.content)}
                imageUrl={post.featured_image || ''}
                author={{
                  name: post.author.full_name,
                  avatar: post.author.avatar_url
                }}
                date={new Date(post.created_at).toLocaleDateString()}
                categories={post.category_ml ? [post.category_ml] : []}
                isDraft={!post.published}
                isOwner={post.author_id === user?.id}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
