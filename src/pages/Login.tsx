import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signInWithProvider } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      const { user } = useAuth();
      console.log("Login successful, user:", user);
      
      // Check user role for admin
      if (user?.role?.toLowerCase() === 'admin') {
        console.log("User is admin, redirecting to /admin");
        navigate('/admin');
      } else {
        console.log("User is not admin, redirecting to /dashboard");
        navigate('/dashboard');
      }
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'facebook' | 'gitlab') => {
    try {
      setIsLoading(true);
      const { user } = await signInWithProvider(provider);
      
      // Check user role for admin
      if (user?.role?.toLowerCase() === 'admin') {
        console.log("Social login: User is admin, redirecting to /admin");
        navigate('/admin');
      } else {
        console.log("Social login: User is not admin, redirecting to /dashboard");
        navigate('/dashboard');
      }
    } catch (_error) {
      setIsLoading(false);
      toast.error('Failed to sign in with social provider');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc88b/a3873901-5b7c-46eb-b9fa-12fea5197bd3/US-en-20240311-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div className="max-w-md w-full space-y-8 form-animate-in bg-black/75 p-8 md:p-16 rounded-xl border border-white/10 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-accent/20 rounded-full blur-3xl"></div>
        
        <div className="text-center relative">
          <div className="mb-2">
            <svg className="w-12 h-12 mx-auto text-accent animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">
            Welcome Back
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Sign in to continue to WebBlog
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-4 mb-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-white text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="relative group">
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-5 pt-5 pb-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300 appearance-none peer"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label
                htmlFor="email-address"
                className="absolute text-white/60 text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-accent transition-all"
              >
                Email address
              </label>
              <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-white/5 pointer-events-none"></div>
            </div>
            
            <div className="relative group">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-5 pt-5 pb-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300 appearance-none peer"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute text-white/60 text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-accent transition-all"
              >
                Password
              </label>
              <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-white/5 pointer-events-none"></div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent/50 border-white/30 rounded bg-white/5"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-accent hover:text-accent/80 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="group py-3"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign in
              </span>
            </Button>
          </div>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-white/70">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              type="button"
              className="group relative flex justify-center items-center px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all duration-300 border border-white/10 hover:border-white/20"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
            >
              <span className="sr-only">Sign in with GitHub</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              type="button"
              className="group relative flex justify-center items-center px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all duration-300 border border-white/10 hover:border-white/20"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
            >
              <span className="sr-only">Sign in with Facebook</span>
              <svg className="w-5 h-5 text-[#1877F2] transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            
            <button
              type="button"
              className="group relative flex justify-center items-center px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all duration-300 border border-white/10 hover:border-white/20"
              onClick={() => handleSocialLogin('gitlab')}
              disabled={isLoading}
            >
              <span className="sr-only">Sign in with GitLab</span>
              <svg className="w-5 h-5 text-[#FC6D26] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 00-.867 0L1.386 9.45.044 13.587a.924.924 0 00.331 1.03L12 23.054l11.625-8.436a.924.924 0 00.33-1.031" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/70">
            New to WebBlog?{' '}
            <Link
              to="/register"
              className="text-accent hover:text-accent/80 font-medium transition-colors duration-200"
            >
              Create an account
            </Link>
          </p>
          
          <p className="mt-4 text-[13px] text-white/50 px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-accent rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-accent/80 rounded-full animate-ping animation-delay-700"></div>
      </div>
    </div>
  );
}
