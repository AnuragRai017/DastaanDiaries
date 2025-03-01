import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-bg-secondary p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
        <div className="border-t border-b border-border py-6 my-6">
          <p className="text-xl mb-4">
            You don't have permission to access this page.
          </p>
          <p className="mb-6 text-text-secondary">
            Your current role: <span className="font-bold">{user?.role || 'Unknown'}</span>
          </p>
          <p className="text-sm text-text-secondary mb-6">
            If you believe you should have access to this page, please contact an administrator.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}