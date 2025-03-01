import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-netflix-red mb-4">404</h1>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Lost your way?</h2>
          <p className="text-netflix-gray">
            Sorry, we can't find that page. You'll find lots to explore on the home page.
          </p>
          <Link
            to="/"
            className="netflix-button inline-block group mt-6"
          >
            <span className="relative inline-flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Netflix Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}