import React, { useState, useRef, useEffect } from 'react';
import { BlogCategory } from '../lib/types';
import { getCategoryColor } from '../lib/categoryService';

interface CategoryDropdownProps {
  categories: BlogCategory[];
  selectedCategory: string;
  onChange: (category: string) => void;
  placeholder?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  selectedCategory,
  onChange,
  placeholder = 'All Categories'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full p-2 rounded-md bg-[#1f1f1f] border border-white/20 text-white focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {selectedCategory ? (
            <>
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getCategoryColor(selectedCategory as BlogCategory) }}
              />
              <span>{selectedCategory}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#1f1f1f] border border-white/20 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            <button
              className={`flex items-center w-full px-4 py-2 text-left hover:bg-[#e50914]/10 ${
                !selectedCategory ? 'bg-[#e50914]/20' : ''
              }`}
              onClick={() => handleSelect('')}
            >
              <span>{placeholder}</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                className={`flex items-center w-full px-4 py-2 text-left hover:bg-[#e50914]/10 ${
                  selectedCategory === category ? 'bg-[#e50914]/20' : ''
                }`}
                onClick={() => handleSelect(category)}
              >
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
