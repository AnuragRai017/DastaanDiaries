import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Post, Comment } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Editor } from '@tinymce/tinymce-react';
import { generateSignature } from '../lib/cloudinaryConfig';

export default function AdminDashboard(): JSX.Element {
  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string>('');
  
  // Post management state
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  
  // Comment management state
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
  const [commentFilter, setCommentFilter] = useState<'all' | 'reported'>('all');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'comments'>('users');
  const [isUploading, setIsUploading] = useState(false);
  const [postFilter, setPostFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [userRoleInput, setUserRoleInput] = useState<'user' | 'admin'>('user');
  
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchAllPosts();
    fetchAllComments();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  }

  async function fetchAllPosts() {
    try {
      // Fetch all posts regardless of author
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get all unique author IDs
      const authorIds = [...new Set(posts?.map(post => post.author_id) || [])];
      
      // Fetch all relevant profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', authorIds);

      if (profilesError) throw profilesError;
      
      // Map profiles to posts
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]));
      
      const postsWithAuthors = posts?.map(post => ({
        ...post,
        author: profileMap.get(post.author_id) || { 
          username: 'Unknown',
          full_name: 'Unknown User'
        }
      })) || [];

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  async function fetchAllComments() {
    try {
      // Fetch all comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
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
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setPreviewAvatar(user.avatar_url || '');
    setUserRoleInput(user.role || 'user');
  };

  const handlePostSelect = (post: Post) => {
    setSelectedPost(post);
    setPostTitle(post.title);
    setPostContent(post.content);
    setIsEditingPost(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  async function uploadToCloudinary(file: File, resourceType: 'image' | 'video' | 'auto') {
    try {
      const timestamp = String(Math.round(new Date().getTime() / 1000));
      const signature = await generateSignature(timestamp);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp);
      formData.append('api_key', '752847587235562');
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dckv73izl/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  const handleUpdateAvatar = async () => {
    if (!selectedUser || !avatarFile) return;

    setIsUploading(true);
    try {
      // Upload to Cloudinary
      const avatarUrl = await uploadToCloudinary(avatarFile, 'image');
      
      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Update local state
      const updatedUser = { ...selectedUser, avatar_url: avatarUrl };
      setUsers(users.map(u => 
        u.id === selectedUser.id ? updatedUser : u
      ));
      setSelectedUser(updatedUser);
      setPreviewAvatar(avatarUrl);
      setAvatarFile(null);

      // Reset the file input
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !userRoleInput) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: userRoleInput })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: userRoleInput } : u
      ));
      setSelectedUser({ ...selectedUser, role: userRoleInput });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete user's posts first
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('author_id', selectedUser.id);

      if (postsError) throw postsError;
      
      // Then delete the user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // Finally, delete the auth user (would require additional setup for auth hooks)
      // This would typically require a server-side function with admin privileges
      
      // Update local state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setPosts(posts.filter(p => p.author_id !== selectedUser.id));
      setSelectedUser(null);
      setShowDeleteUserDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdatePost = async () => {
    if (!selectedPost || !postTitle || !postContent) return;

    setIsUploading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: postTitle,
          content: postContent,
        })
        .eq('id', selectedPost.id);

      if (error) throw error;

      // Update local state
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, title: postTitle, content: postContent }
          : p
      ));
      
      setIsEditingPost(false);
      setSelectedPost(null);
      setPostTitle('');
      setPostContent('');
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', selectedPost.id);

      if (error) throw error;

      // Update local state
      setPosts(posts.filter(p => p.id !== selectedPost.id));
      setSelectedPost(null);
      setShowDeletePostDialog(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', selectedComment.id);

      if (error) throw error;

      // Update local state
      setComments(comments.filter(c => c.id !== selectedComment.id));
      setSelectedComment(null);
      setShowDeleteCommentDialog(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const togglePublishStatus = async (post: Post) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ published: !post.published })
        .eq('id', post.id);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === post.id 
          ? { ...p, published: !p.published }
          : p
      ));
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(post => {
    // First apply search term filter
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Then apply status filter
    if (postFilter === 'published') {
      return matchesSearch && post.published;
    } else if (postFilter === 'draft') {
      return matchesSearch && !post.published;
    }
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab navigation */}
      <div className="flex border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`mr-4 py-2 px-4 focus:outline-none ${
            activeTab === 'users' 
              ? 'border-b-2 border-primary text-primary font-medium' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          className={`mr-4 py-2 px-4 focus:outline-none ${
            activeTab === 'posts' 
              ? 'border-b-2 border-primary text-primary font-medium' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Manage Posts
        </button>
        <button 
          onClick={() => setActiveTab('comments')}
          className={`mr-4 py-2 px-4 focus:outline-none ${
            activeTab === 'comments' 
              ? 'border-b-2 border-primary text-primary font-medium' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Manage Comments
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : activeTab === 'users' ? (
        // User Management Tab
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-background-secondary rounded-lg p-6 shadow-lg">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-primary text-white'
                      : 'bg-background-tertiary hover:bg-background-hover'
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center space-x-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username || 'User avatar'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                        {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{user.full_name || user.username}</h3>
                      <p className="text-sm opacity-75">{user.email}</p>
                      <p className="text-sm opacity-75">Role: {user.role || 'user'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background-secondary rounded-lg p-6 shadow-lg">
            {selectedUser ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Edit User: {selectedUser.username}</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar</label>
                    <div className="flex items-center space-x-4">
                      {previewAvatar ? (
                        <img
                          src={previewAvatar}
                          alt="Avatar preview"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold">
                          {(selectedUser.full_name || selectedUser.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-hover transition-colors"
                        >
                          Choose Image
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateAvatar}
                    disabled={!avatarFile || isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Updating...' : 'Update Avatar'}
                  </button>

                  <div className="border-t border-border pt-6">
                    <label className="block text-sm font-medium mb-2">User Role</label>
                    <div className="flex gap-3">
                      <select
                        value={userRoleInput}
                        onChange={(e) => setUserRoleInput(e.target.value as 'user' | 'admin')}
                        className="w-40 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{
                          WebkitAppearance: 'menulist',
                          appearance: 'menulist'
                        }}
                      >
                        <option value="user" style={{ backgroundColor: 'white', color: 'black', padding: '8px' }}>User</option>
                        <option value="admin" style={{ backgroundColor: 'white', color: 'black', padding: '8px' }}>Admin</option>
                      </select>
                      <button
                        onClick={handleUpdateRole}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        Update Role
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-xl font-semibold mb-4">Danger Zone</h3>
                    <button
                      onClick={() => setShowDeleteUserDialog(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete User Account
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-text-secondary">
                Select a user to edit their details
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'posts' ? (
        // Post Management Tab
        <div>
          <div className="flex justify-between mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search posts..."
                className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex">
                <button
                  onClick={() => setPostFilter('all')}
                  className={`px-4 py-2 rounded-l-lg ${
                    postFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-background-secondary hover:bg-background-hover'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPostFilter('published')}
                  className={`px-4 py-2 ${
                    postFilter === 'published'
                      ? 'bg-primary text-white'
                      : 'bg-background-secondary hover:bg-background-hover'
                  }`}
                >
                  Published
                </button>
                <button
                  onClick={() => setPostFilter('draft')}
                  className={`px-4 py-2 rounded-r-lg ${
                    postFilter === 'draft'
                      ? 'bg-primary text-white'
                      : 'bg-background-secondary hover:bg-background-hover'
                  }`}
                >
                  Drafts
                </button>
              </div>
            </div>
          </div>

          {isEditingPost && selectedPost ? (
            <div className="bg-background-secondary rounded-lg p-6 shadow-lg mb-8">
              <h2 className="text-xl font-bold mb-4">Edit Post</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Editor
                    id="tiny-editor-admin"
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    init={{
                      height: 500,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                      content_style: 'body { font-family:Inter,Arial,sans-serif; font-size:16px }'
                    }}
                    value={postContent}
                    onEditorChange={setPostContent}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsEditingPost(false);
                      setSelectedPost(null);
                      setPostTitle('');
                      setPostContent('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePost}
                    disabled={isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                  >
                    {isUploading ? <LoadingSpinner size="sm" /> : 'Update Post'}
                  </button>
                  <button
                    onClick={() => setShowDeletePostDialog(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-background-secondary rounded-lg shadow-lg overflow-hidden">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        post.published
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePostSelect(post)}
                          className="text-text-secondary hover:text-primary"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => togglePublishStatus(post)}
                          className="text-text-secondary hover:text-primary"
                          title={post.published ? 'Unpublish' : 'Publish'}
                        >
                          {post.published ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setShowDeletePostDialog(true);
                          }}
                          className="text-text-secondary hover:text-red-500"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mb-3">
                      By {post.author?.full_name || post.author?.username || 'Unknown'}
                    </p>
                    <p className="text-text-secondary line-clamp-3">
                      {post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                    </p>
                    <div className="mt-4 text-sm text-text-secondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-text-primary">
                No posts found
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm 
                  ? "No posts match your search criteria" 
                  : postFilter === 'all'
                  ? "There are no posts in the system"
                  : `No ${postFilter} posts found`}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Comments Management Tab
        <div>
          <div className="flex justify-between mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search comments..."
                className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex">
                <button
                  onClick={() => setCommentFilter('all')}
                  className={`px-4 py-2 rounded-l-lg ${
                    commentFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-background-secondary hover:bg-background-hover'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCommentFilter('reported')}
                  className={`px-4 py-2 rounded-r-lg ${
                    commentFilter === 'reported'
                      ? 'bg-primary text-white'
                      : 'bg-background-secondary hover:bg-background-hover'
                  }`}
                >
                  Reported
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {comments
              .filter(comment => 
                comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comment.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comment.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(comment => (
                <div key={comment.id} className="bg-background-secondary rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {comment.user.avatar_url ? (
                        <img
                          src={comment.user.avatar_url}
                          alt={comment.user.username || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                          <span className="text-white text-xs">
                            {(comment.user.username || 'U').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{comment.user.username || comment.user.full_name}</div>
                        <div className="text-sm text-text-secondary">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedComment(comment);
                        setShowDeleteCommentDialog(true);
                      }}
                      className="text-text-secondary hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-text-primary whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-text-primary">
                No comments found
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm 
                  ? "No comments match your search criteria" 
                  : commentFilter === 'reported'
                  ? "No reported comments found"
                  : "There are no comments in the system"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Post Confirmation Dialog */}
      {showDeletePostDialog && selectedPost && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background-primary rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              Delete Post
            </h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{selectedPost.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeletePostDialog(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {showDeleteUserDialog && selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background-primary rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              Delete User Account
            </h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete the account for "{selectedUser.username || selectedUser.email}"? This will permanently remove their account and all their posts. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteUserDialog(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Dialog */}
      {showDeleteCommentDialog && selectedComment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background-primary rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              Delete Comment
            </h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteCommentDialog(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComment}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}