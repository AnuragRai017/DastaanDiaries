import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BlogTooltip from './BlogTooltip';
import { BlogCategory } from '../lib/types';
import { getCategoryColor } from '../lib/categoryService';

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: string;
  };
  date: string;
  imageUrl?: string;
  categories?: string[];
  isDraft?: boolean;
  isOwner?: boolean;
  content?: string; // Made optional since it's not being used
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  excerpt,
  author,
  date,
  imageUrl,
  categories = [],
  isDraft = false,
  isOwner = false,
  content, // Keep it in the destructuring but make it last since it's optional
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Get initials safely, handling cases where author name might be undefined
  const getInitials = () => {
    if (!author || !author.name) return "??";
    return author.name.substring(0, 2).toUpperCase();
  };
  
  return (
    <BlogTooltip
      title={title}
      excerpt={excerpt}
      author={author?.name || "Unknown"}
      date={formattedDate}
      imageUrl={imageUrl}
    >
      <div
        className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg 
                  transition-all duration-500 h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/blog/${id}`} className="block h-full">
          {imageUrl && (
            <div className="relative overflow-hidden h-48">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              <div 
                className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/80 
                          transition-opacity duration-500 ${isHovered ? 'opacity-50' : 'opacity-70'}`}
              />
              {categories.length > 0 && (
                <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end">
                  {categories.map((category) => (
                    <span 
                      key={category}
                      className="px-2 py-1 text-xs rounded-md text-white backdrop-blur-sm"
                      style={{ backgroundColor: getCategoryColor(category as BlogCategory) }}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
              
              {isDraft && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs rounded-md bg-yellow-500/80 text-white backdrop-blur-sm">
                    Draft
                  </span>
                </div>
              )}
            </div>
          )}
        
          <div className="p-5">
            <h3 className={`text-white text-xl font-bold mb-2 transition-all duration-500 ${isHovered ? 'text-accent' : ''}`}>
              {title}
            </h3>
            
            <p className="text-white/70 text-sm line-clamp-2 mb-4">
              {excerpt}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {author?.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name || "Author"}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
                    <span className="text-white text-xs">{getInitials()}</span>
                  </div>
                )}
                <span className="text-white/60 text-xs">{author?.name || "Unknown"}</span>
              </div>
              
              <span className="text-white/60 text-xs">{formattedDate}</span>
            </div>
            
            {/* Display categories if no image */}
            {!imageUrl && categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span 
                    key={category}
                    className="px-2 py-1 text-xs rounded-md text-white"
                    style={{ backgroundColor: getCategoryColor(category as BlogCategory) }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>
    </BlogTooltip>
  );
};

export default BlogCard;