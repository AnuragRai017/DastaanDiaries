import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function NavBar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function for avatar display - Enhance visibility
  const renderAvatar = (size = "w-8 h-8") => (
    <div className={`${size} rounded-full overflow-hidden bg-purple-600 border-2 border-purple-400 shadow-md transition-all duration-300`}>
      {user?.avatar_url ? (
        <img 
          src={user.avatar_url} 
          alt={user.username || 'User avatar'} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
          {(user?.username || user?.full_name || 'U').charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500
                ${isScrolled 
                  ? 'bg-bg-primary/75 backdrop-blur-xl shadow-lg border-b border-white/5' 
                  : 'bg-gradient-to-b from-bg-primary to-transparent'}
                ${theme === 'light' ? 'text-black' : 'text-white'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="group flex items-center space-x-2 text-2xl font-bold transition-all duration-300"
            >
              <div className="relative overflow-hidden rounded-lg">
                <img src="/src/assets/logo.svg" alt="DastaanDiaries Logo" className="w-8 h-8 filter drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
              </div>
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme === 'light' ? 'from-gray-800 to-black' : 'from-white to-gray-300'} group-hover:from-accent group-hover:to-white transition-all duration-300`}>
              DastaanDiaries
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && (
              <div className="mr-3 transition-transform hover:scale-105">
                {renderAvatar("w-8 h-8")}
              </div>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md focus:outline-none ${
                theme === 'light' 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              } transition-colors duration-200`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-1">
              <NavLink to="/" isActive={location.pathname === '/'} icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-2 2h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }>
                Home
              </NavLink>
                
              <NavLink 
                to="/blog" 
                isActive={location.pathname.startsWith('/blog')}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                  </svg>
                }
              >
                Blog
              </NavLink>
            </div>

            {/* User menu or sign in */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-2 focus:outline-none py-2 px-3 rounded-lg 
                    ${theme === 'light' 
                      ? 'bg-white/80 hover:bg-white text-gray-800 shadow-md border border-gray-200' 
                      : 'bg-gray-800 hover:bg-gray-700 text-white shadow-md border border-gray-700'} 
                    transition-colors duration-200`}
                >
                  {renderAvatar("w-9 h-9")}
                  <span className="text-sm font-bold hover:text-accent transition-colors duration-200">
                    {user.username || user.full_name || 'User'}
                  </span>
                  <svg 
                    className="w-4 h-4 transition-all duration-300 text-accent"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu with animated appearance */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 transition-all duration-200 origin-top-right z-50">
                    <div className="rounded-lg shadow-xl ring-1 ring-black/20 overflow-hidden">
                      <div className={`relative ${theme === 'light' 
                        ? 'bg-white text-gray-800 shadow-lg border border-gray-200' 
                        : 'bg-gray-800 text-white shadow-lg border border-gray-700'} 
                        py-2 rounded-lg`}>
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none rounded-lg"></div>
                        
                        {/* User info at top - Enhanced visibility */}
                        <div className="px-4 py-3 border-b border-gray-200/20 mb-1">
                          <div className="flex items-center space-x-3">
                            {renderAvatar("w-12 h-12")}
                            <div className="flex flex-col">
                              <span className="text-base font-bold">
                                {user.full_name || user.username || 'User'}
                              </span>
                              <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                {user.email || 'user@example.com'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {user?.role?.toLowerCase() === 'admin' && (
                          <Link
                            to="/admin"
                            className={`flex items-center px-4 py-2 text-sm font-medium
                              ${theme === 'light' 
                                ? 'text-gray-800 hover:bg-gray-100' 
                                : 'text-white hover:bg-gray-700'
                              } transition-all duration-200 ${
                              location.pathname === '/admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''
                            }`}
                          >
                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <Link
                          to="/dashboard"
                          className={`flex items-center px-4 py-2 text-sm font-medium
                            ${theme === 'light' 
                              ? 'text-gray-800 hover:bg-gray-100' 
                              : 'text-white hover:bg-gray-700'
                            } transition-all duration-200 ${
                            location.pathname === '/dashboard' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''
                          }`}
                        >
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Dashboard
                        </Link>
                        
                        <Link
                          to="/profile"
                          className={`flex items-center px-4 py-2 text-sm font-medium
                            ${theme === 'light' 
                              ? 'text-gray-800 hover:bg-gray-100' 
                              : 'text-white hover:bg-gray-700'
                            } transition-all duration-200 ${
                            location.pathname === '/profile' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''
                          }`}
                        >
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile Settings
                        </Link>
                        
                        <div className={`border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} my-1`}></div>
                        
                        <button
                          onClick={signOut}
                          className={`flex items-center w-full text-left px-4 py-2 text-sm font-medium text-red-600 ${theme === 'light' ? 'hover:bg-red-50' : 'hover:bg-red-900/30'} transition-all duration-200`}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-accent/30 transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </Link>
            )}

            {/* Theme toggle button with animation */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg shadow-md border ${theme === 'light' 
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 hover:text-purple-700' 
                : 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700 hover:text-purple-300'} 
                transition-all duration-300 transform hover:scale-110`}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`${theme === 'light' 
          ? 'bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg' 
          : 'bg-gray-900/95 backdrop-blur-lg border-t border-white/5 shadow-lg'} 
          px-2 pt-2 pb-3 space-y-1 sm:px-3`}>
          <NavLink 
            to="/" 
            isActive={location.pathname === '/'} 
            mobile={true}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-2 2h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/blog" 
            isActive={location.pathname.startsWith('/blog')} 
            mobile={true}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            }
          >
            Blog
          </NavLink>
          
          {user ? (
            <>
              {user?.role?.toLowerCase() === 'admin' && (
                <NavLink 
                  to="/admin" 
                  isActive={location.pathname === '/admin'} 
                  mobile={true}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                >
                  Admin Dashboard
                </NavLink>
              )}
              
              <NavLink 
                to="/dashboard" 
                isActive={location.pathname === '/dashboard'} 
                mobile={true}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              >
                Dashboard
              </NavLink>
              
              <NavLink 
                to="/profile" 
                isActive={location.pathname === '/profile'} 
                mobile={true}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              >
                Profile Settings
              </NavLink>
              
              <button
                onClick={signOut}
                className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white bg-accent hover:bg-accent/90 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </Link>
          )}
          
          <button
            onClick={toggleTheme}
            className={`flex w-full items-center px-3 py-2 rounded-md text-base font-medium 
              ${theme === 'light' 
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200' 
                : 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'} 
              transition-all duration-200`}
          >
            <span className="mr-3">
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </nav>
  );
}

// Helper component for navigation links
function NavLink({ to, children, isActive, icon, mobile = false }: { 
  to: string, 
  children: React.ReactNode,
  isActive: boolean,
  icon?: React.ReactNode,
  mobile?: boolean 
}) {
  const { theme } = useTheme();
  
  return (
    <Link
      to={to}
      className={`
        ${mobile 
          ? 'flex items-center px-3 py-2 rounded-md text-base font-medium' 
          : 'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium'}
        ${isActive 
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-bold' 
          : theme === 'light'
            ? 'text-gray-800 hover:bg-gray-100 hover:text-purple-700'
            : 'text-white hover:bg-gray-700 hover:text-purple-300'}
        transition-all duration-200 border ${isActive 
          ? theme === 'light' ? 'border-purple-200' : 'border-purple-800' 
          : theme === 'light' ? 'border-transparent' : 'border-transparent'}
      `}
    >
      {icon && <span className={`mr-2 ${isActive ? 'text-purple-600' : ''}`}>{icon}</span>}
      {children}
      {isActive && (
        <span className="ml-2 w-1.5 h-1.5 rounded-full bg-purple-500"></span>
      )}
    </Link>
  );
}