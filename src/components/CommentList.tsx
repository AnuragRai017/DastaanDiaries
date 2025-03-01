import React, { useState, useEffect } from 'react';
import { Comment as CommentType } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Comment from './Comment';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

interface CommentListProps {
  postId: string;
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    try {
      setLoading(true);
      
      // Fetch comments for this post
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (commentsError) throw commentsError;
      
      // Get all unique user IDs
      const userIds = [...new Set(commentsData?.map(comment => comment.user_id) || [])];
      
      // Fetch all relevant user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Map profiles to comments
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]));
      
      const commentsWithUsers = commentsData?.map(comment => ({
        ...comment,
        user: profileMap.get(comment.user_id) || { 
          username: 'Unknown',
          full_name: 'Unknown User'
        }
      })) || [];
      
      setComments(commentsWithUsers);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('comments')
        .insert([
          { 
            content: newComment.trim(),
            post_id: postId,
            user_id: user.id
          }
        ])
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Add user info to the new comment
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const newCommentWithUser = {
        ...data,
        user: profile || {
          username: user.username || 'Unknown',
          full_name: user.full_name || 'Unknown User',
          avatar_url: user.avatar_url
        }
      };
      
      // Add the new comment to the list
      setComments([newCommentWithUser, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      // Remove the deleted comment from the list
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId);
      
      if (error) throw error;
      
      // Update the comment in the list
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content, updated_at: new Date().toISOString() }
          : comment
      ));
      
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleReportComment = async (commentId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          reported: true,
          report_reason: reason
        })
        .eq('id', commentId);
      
      if (error) throw error;
      
      // Update the comment in the list
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, reported: true, report_reason: reason }
          : comment
      ));
      
      toast.success('Comment reported successfully');
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast.error('Failed to report comment');
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-white">Comments</h2>
      
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
              rows={3}
              disabled={submitting}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white/80 text-center">
          Please <a href="/login" className="text-accent hover:underline">log in</a> to leave a comment.
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : comments.length > 0 ? (
        <div>
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={handleDeleteComment}
              onUpdate={handleUpdateComment}
              onReport={handleReportComment}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-white/60">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
};

export default CommentList;
