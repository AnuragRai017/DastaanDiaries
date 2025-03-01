import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';
type PageTransition = 'fade' | 'slide' | 'scale';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  pageTransition: PageTransition;
  setPageTransition: (transition: PageTransition) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'dark';
  });
  
  const [pageTransition, setPageTransition] = useState<PageTransition>('fade');

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('theme', theme);
    
    // Update document with theme class and CSS variables
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--accent-color', '#8B5CF6');
      root.style.setProperty('--accent-rgb', '139, 92, 246');
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--text-primary', '#FFFFFF');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--accent-color', '#6D28D9');
      root.style.setProperty('--accent-rgb', '109, 40, 217');
      root.style.setProperty('--bg-primary', '#F8FAFC');
      root.style.setProperty('--text-primary', '#1E293B');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme, 
      pageTransition, 
      setPageTransition 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};