import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { supabase } from '../lib/supabase';
import { Post, BlogCategory } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateSignature } from '../lib/cloudinaryConfig';
import { categorizeContent, getAllCategories, getCategoryColor } from '../lib/categoryService';

export default function UserDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('');
  const [suggestedCategory, setSuggestedCategory] = useState<BlogCategory | null>(null);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const { user } = useAuth();
  const allCategories = getAllCategories();

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  async function fetchPosts() {
    try {
      // First fetch all user's posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Then fetch the user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Combine posts with author profile
      const postsWithAuthor = posts?.map(post => ({
        ...post,
        author: profile || { 
          username: 'Unknown',
          full_name: 'Unknown User'
        }
      })) || [];

      setPosts(postsWithAuthor);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  const filteredPosts = posts.filter(post => {
    switch (filter) {
      case 'published':
        return post.published;
      case 'draft':
        return !post.published;
      default:
        return true;
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/10');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/10');
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

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category || '');
    setPreviewImage(post.featured_image || '');
    setIsEditMode(true);
    setIsCreating(true);
  };

  const handleDeletePost = async (post: Post) => {
    setSelectedPost(post);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', selectedPost.id);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== selectedPost.id));
      setShowDeleteDialog(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Analyze content and suggest category
  const suggestCategory = () => {
    if (content) {
      const suggested = categorizeContent(content);
      setSuggestedCategory(suggested);
    }
  };

  // Apply the suggested category
  const applyCategory = () => {
    if (suggestedCategory) {
      setCategory(suggestedCategory);
      setSuggestedCategory(null);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) {
      return;
    }

    try {
      setIsUploading(true);

      let featuredImageUrl = '';
      let audioUrl = '';

      if (featuredImage) {
        featuredImageUrl = await uploadToCloudinary(featuredImage, 'image');
      }

      if (audioFile) {
        audioUrl = await uploadToCloudinary(audioFile, 'auto');
      }

      // Auto-categorize if no category is selected
      const finalCategory = category || categorizeContent(content);
      
      if (isEditMode) {
        const { error } = await supabase
          .from('posts')
          .update({
            title,
            content,
            featured_image: featuredImageUrl || selectedPost?.featured_image,
            audio_url: audioUrl || selectedPost?.audio_url,
            category: finalCategory,
          })
          .eq('id', selectedPost?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert({
            title,
            content,
            author_id: user?.id,
            featured_image: featuredImageUrl,
            audio_url: audioUrl,
            published: false,
            category: finalCategory,
          });

        if (error) throw error;
      }

      setTitle('');
      setContent('');
      setCategory('');
      setSuggestedCategory(null);
      setFeaturedImage(null);
      setAudioFile(null);
      setPreviewImage('');
      setIsCreating(false);
      setIsEditMode(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsUploading(false);
    }
  }

  async function togglePublishStatus(post: Post) {
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
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Blog Posts</h1>
        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditMode(false);
            setTitle('');
            setContent('');
            setCategory('');
            setSuggestedCategory(null);
            setPreviewImage('');
            setFeaturedImage(null);
            setAudioFile(null);
          }}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Create New Post
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'published'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Published
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'draft'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Drafts
        </button>
      </div>

      {isCreating ? (
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            {isEditMode ? 'Edit Post' : 'Create New Post'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input mt-1 w-full"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <Editor
                id="tiny-editor"
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
                value={content}
                onEditorChange={(newContent) => {
                  setContent(newContent);
                  // Reset suggested category when content changes significantly
                  setSuggestedCategory(null);
                }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <button
                  type="button"
                  onClick={suggestCategory}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Suggest category
                </button>
              </div>
              
              {suggestedCategory && (
                <div className="mb-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Suggested category: 
                    </span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-md text-white ${getCategoryColor(suggestedCategory)}`}>
                      {suggestedCategory}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={applyCategory}
                    className="text-xs bg-primary-500 text-white px-2 py-1 rounded-md hover:bg-primary-600"
                  >
                    Apply
                  </button>
                </div>
              )}
              
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input mt-1 w-full"
              >
                <option value="">Select a category</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                If no category is selected, one will be automatically assigned based on content.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Image
              </label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg transition-colors duration-200"
                onDrop={handleImageDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-1 text-center">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="mx-auto h-32 w-auto rounded"
                      />
                      <button
                        type="button"
                        title="Remove preview image"
                        onClick={() => {
                          setPreviewImage('');
                          setFeaturedImage(null);
                        }}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Audio File (optional)
              </label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg transition-colors duration-200"
                onDrop={handleAudioDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-1 text-center">
                  {audioFile ? (
                    <div className="relative">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M12 1a3 3 0 00-3 3v32a3 3 0 003 3h28a3 3 0 003-3V4a3 3 0 00-3-3H12zm15 33a1 1 0 01-2 0v-6H8v6a1 1 0 01-2 0v-8a3 3 0 013-3h13a3 3 0 013 3v8a1 1 0 01-2 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {audioFile.name}
                      </p>
                      <button
                        title="Remove audio file"
                        type="button"
                        onClick={() => {
                          setAudioFile(null);
                        }}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M12 1a3 3 0 00-3 3v32a3 3 0 003 3h28a3 3 0 003-3V4a3 3 0 00-3-3H12zm15 33a1 1 0 01-2 0v-6H8v6a1 1 0 01-2 0v-8a3 3 0 013-3h13a3 3 0 013 3v8a1 1 0 01-2 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="audio-file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload a file</span>
                          <input
                            id="audio-file-upload"
                            name="audio-file-upload"
                            type="file"
                            className="sr-only"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        MP3, WAV up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditMode(false);
                  setSelectedPost(null);
                  setTitle('');
                  setContent('');
                  setCategory('');
                  setSuggestedCategory(null);
                  setFeaturedImage(null);
                  setAudioFile(null);
                  setPreviewImage('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {isUploading ? 'Creating...' : isEditMode ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {post.featured_image && (
                <div className="relative">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  {post.category && (
                    <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-md text-white ${getCategoryColor(post.category as BlogCategory)}`}>
                      {post.category}
                    </span>
                  )}
                </div>
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
                      onClick={() => handleEditPost(post)}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-500"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => togglePublishStatus(post)}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-500"
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
                      onClick={() => handleDeletePost(post)}
                      className="text-gray-600 dark:text-gray-300 hover:text-red-500"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                  {post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No posts found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all'
              ? "Get started by creating your first post"
              : `No ${filter} posts found`}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedPost && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Post
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{selectedPost.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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