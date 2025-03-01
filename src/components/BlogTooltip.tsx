import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface BlogTooltipProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl?: string;
  children: React.ReactElement;
}

const BlogTooltip: React.FC<BlogTooltipProps> = ({
  title,
  excerpt,
  author,
  date,
  imageUrl,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update tooltip position when it becomes visible to prevent it from going off-screen
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Calculate position based on trigger element
      let x = triggerRect.x + (triggerRect.width / 2) - (tooltipRect.width / 2);
      let y = triggerRect.y - tooltipRect.height - 10;
      
      // Adjust if off screen
      if (x < 10) x = 10;
      if (x + tooltipRect.width > window.innerWidth - 10) {
        x = window.innerWidth - tooltipRect.width - 10;
      }
      
      // If tooltip would appear above viewport, show below instead
      if (y < 10) {
        y = triggerRect.bottom + 10;
      }
      
      setPosition({ x, y });
    }
  }, [isVisible]);

  return (
    <div 
      className="relative inline-block"
      ref={triggerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{ 
              position: 'fixed', 
              left: position.x, 
              top: position.y,
              zIndex: 50
            }}
            className="w-72 rounded-xl overflow-hidden backdrop-blur-lg bg-black/70 border border-white/10 shadow-xl"
          >
            {imageUrl && (
              <div className="w-full h-32 overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-white font-medium mb-1">{title}</h3>
              <p className="text-white/80 text-sm line-clamp-2 mb-2">{excerpt}</p>
              <div className="flex justify-between items-center text-xs text-white/60">
                <span>{author}</span>
                <span>{date}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogTooltip;
