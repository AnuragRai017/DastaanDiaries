import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Post, BlogCategory } from '../lib/types';
import { getCategoryColor, categorizeContent } from '../lib/categoryService';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any posts with undefined or null ids
      const validPosts = (data || []).filter(post => post.id);
      
      // Apply ML categorization if category_ml is not set
      const categorizedPosts = validPosts.map(post => {
        if (!post.category_ml) {
          post.category_ml = categorizeContent(post.content);
        }
        return post;
      });
      
      setPosts(categorizedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <h1 className="text-5xl font-bold text-text-primary mb-2 animate-fade-in">
            Latest Blog Posts
          </h1>
          <div className="h-1 w-24 bg-accent mb-12 animate-slide-up" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            post.id ? (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group relative block animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={`
                  relative overflow-hidden rounded-xl transition-all duration-500 ease-out
                  transform-gpu ${hoveredId === post.id ? 'scale-[1.02] shadow-lg' : 'shadow-md'}
                `}>
                  <div className="aspect-w-16 aspect-h-9 bg-bg-secondary">
                    <img
                      src={post.featured_image || '/default-blog-image.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out"
                    />
                    <div className={`
                      absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent
                      transition-opacity duration-300
                      ${hoveredId === post.id ? 'opacity-90' : 'opacity-70'}
                    `} />
                  </div>
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Category Badge */}
                    {post.category_ml && (
                      <div className="absolute top-4 left-4">
                        <span 
                          className="px-3 py-1 text-sm font-medium text-white rounded-full"
                          style={{ backgroundColor: getCategoryColor(post.category_ml) }}
                        >
                          {post.category_ml}
                        </span>
                      </div>
                    )}
                    
                    <h2 className={`
                      text-2xl font-bold text-text-primary mb-2 transition-transform duration-300
                      transform-gpu ${hoveredId === post.id ? 'translate-y-0' : 'translate-y-2'}
                    `}>
                      {post.title}
                    </h2>
                    
                    <div className={`
                      overflow-hidden transition-all duration-500
                      ${hoveredId === post.id ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                      <p className="text-text-secondary text-sm line-clamp-3">
                        {post.content.replace(/<[^>]+>/g, '').slice(0, 150)}...
                      </p>
                    </div>

                    {post.audio_url && (
                      <div className={`
                        absolute top-4 right-4 transition-all duration-300
                        transform-gpu ${hoveredId === post.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                      `}>
                        <span className="bg-accent text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                          <span>Audio available</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
}