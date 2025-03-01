import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { Suspense, lazy } from 'react';
import NavBar from './components/NavBar';
import LoadingSpinner from './components/LoadingSpinner';
import CustomCursor from './components/CustomCursor';
import PageTransition from './components/PageTransition';
import PageLoading from './components/PageLoading';
import ThemeBackground from './components/ThemeBackground';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import { Toaster } from 'react-hot-toast';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

import './App.css';
import './styles/theme.css';
import './styles/animations.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen transition-all duration-300 bg-gradient-to-br from-bg-primary to-bg-secondary">
              <ThemeBackground />
              <CustomCursor />
              <PageLoading />
              <NavBar />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }
                }}
              />
              <PageTransition>
                <main className="pt-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto relative">
                  <Suspense fallback={
                    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                      <div className="relative">
                        <LoadingSpinner size="lg" />
                        <div className="mt-4 text-text-secondary animate-pulse">
                          Loading content...
                        </div>
                      </div>
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      } />
                      <Route path="/register" element={
                        <PublicRoute>
                          <Register />
                        </PublicRoute>
                      } />
                      <Route path="/admin/*" element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } />
                      <Route path="/dashboard/*" element={
                        <PrivateRoute>
                          <UserDashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/blog" element={<BlogListPage />} />
                      <Route path="/blog/:id" element={<BlogPost />} />
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <ProfileSettings />
                        </PrivateRoute>
                      } />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </Suspense>
                </main>
              </PageTransition>
            </div>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
