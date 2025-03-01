import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PageLoading() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <motion.div
        className="h-1 bg-netflix-red"
        initial={{ width: "0%" }}
        animate={{ 
          width: ["0%", "70%", "100%"],
          transition: { 
            duration: 0.5,
            times: [0, 0.7, 1],
            ease: ["easeInOut", "easeOut"]
          }
        }}
      />
    </div>
  );
}