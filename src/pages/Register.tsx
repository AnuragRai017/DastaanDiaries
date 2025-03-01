import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      setIsLoading(false);
      return;
    }
    if (!username.match(/^[a-zA-Z0-9_]+$/)) {
      setError('Username can only contain letters, numbers, and underscores');
      setIsLoading(false);
      return;
    }
    
    try {
      await signUp(email, password, username, fullName);
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account');
      }
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
            Create Account
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Join WebBlog and start sharing your stories
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
                id="username"
                name="username"
                type="text"
                required
                className="block w-full px-5 pt-5 pb-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300 appearance-none peer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
              />
              <label
                htmlFor="username"
                className="absolute text-white/60 text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-accent transition-all"
              >
                Username
              </label>
              <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-white/5 pointer-events-none"></div>
            </div>

            <div className="relative group">
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="block w-full px-5 pt-5 pb-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300 appearance-none peer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder=" "
              />
              <label
                htmlFor="fullName"
                className="absolute text-white/60 text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-accent transition-all"
              >
                Full Name
              </label>
              <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-white/5 pointer-events-none"></div>
            </div>

            <div className="relative group">
              <input
                id="email"
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
                htmlFor="email"
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
                autoComplete="new-password"
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

            <div className="relative group">
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full px-5 pt-5 pb-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300 appearance-none peer"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
              />
              <label
                htmlFor="confirm-password"
                className="absolute text-white/60 text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-accent transition-all"
              >
                Confirm Password
              </label>
              <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-white/5 pointer-events-none"></div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Create Account
              </span>
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent hover:text-accent/80 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
          
          <p className="mt-4 text-[13px] text-white/50 px-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-accent rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-accent/80 rounded-full animate-ping animation-delay-700"></div>
      </div>
    </div>
  );
}
