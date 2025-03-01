import React, { useState } from 'react';
import { Comment as CommentType } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface CommentProps {
  comment: CommentType;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
  onReport?: (id: string, reason: string) => void;
}

const Comment: React.FC<CommentProps> = ({ comment, onDelete, onUpdate, onReport }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const { user } = useAuth();
  
  const isAuthor = user?.id === comment.user.id;
  const isAdmin = user?.role === 'admin';
  const canModify = isAuthor || isAdmin;
  
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
  
  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      onUpdate(comment.id, editedContent);
      setIsEditing(false);
    } else {
      toast.error('Comment cannot be empty');
    }
  };
  
  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      onReport?.(comment.id, reportReason.trim());
      setShowReportDialog(false);
      setReportReason('');
    } else {
      toast.error('Please provide a reason for reporting');
    }
  };
  
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        {comment.user.avatar_url ? (
          <img 
            src={comment.user.avatar_url} 
            alt={comment.user.username || 'User'} 
            className="w-8 h-8 rounded-full mr-2 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center mr-2">
            <span className="text-white text-xs">
              {(comment.user.username || 'U').substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <div className="font-medium text-white">
            {comment.user.username || comment.user.full_name || 'Anonymous'}
          </div>
          <div className="text-xs text-white/60">{formattedDate}</div>
        </div>
        
        <div className="ml-auto flex space-x-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveEdit}
                className="text-accent hover:text-accent/80 transition-colors"
                aria-label="Save"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button 
                onClick={handleCancelEdit}
                className="text-white/60 hover:text-white/80 transition-colors"
                aria-label="Cancel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              {isAuthor && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-white/60 hover:text-white/80 transition-colors"
                  aria-label="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {canModify && (
                <button 
                  onClick={() => onDelete(comment.id)}
                  className="text-white/60 hover:text-red-500 transition-colors"
                  aria-label="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              {user && !isAuthor && !comment.reported && (
                <button 
                  onClick={() => setShowReportDialog(true)}
                  className="text-white/60 hover:text-yellow-500 transition-colors"
                  aria-label="Report"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full bg-black/20 text-white border border-white/20 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent"
          rows={3}
        />
      ) : (
        <p className="text-white/90 break-words">{comment.content}</p>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background-primary rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-medium text-white mb-4">
              Report Comment
            </h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please provide a reason for reporting this comment..."
              className="w-full bg-black/20 text-white border border-white/20 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-accent"
              rows={3}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                }}
                className="px-4 py-2 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comment;
