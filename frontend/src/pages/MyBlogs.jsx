import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import Skeleton from '../components/Skeleton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { Plus, Edit2, Trash2, Eye, EyeOff, FileText, CheckCircle, Clock } from 'lucide-react';

const MyBlogs = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Blogs list states
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, published, draft

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState(null);

  const fetchMyBlogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const params = {
        author: user.user.id,
        search: search.trim() || undefined,
        published: statusFilter === 'published' ? 'true' : statusFilter === 'draft' ? 'false' : undefined,
      };

      const response = await api.get('posts/', { params });
      setBlogs(response.data);
    } catch (err) {
      console.error('Error loading my blogs:', err);
      setError(err.isNetworkError ? err.message : 'Failed to retrieve your blogs list.');
    } finally {
      setLoading(false);
    }
  }, [user, search, statusFilter]);

  // Debounced Search Trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMyBlogs();
    }, 150);
    return () => clearTimeout(delayDebounce);
  }, [fetchMyBlogs]);

  const handlePublishToggle = async (blogId, currentStatus) => {
    try {
      const response = await api.put(`posts/${blogId}/`, {
        published: !currentStatus
      });
      
      // Update local state item
      setBlogs((prev) => prev.map((b) => (b.id === blogId ? response.data : b)));
      
      if (!currentStatus) {
        toast.success('Blog published successfully! It is now visible on the public feed.');
      } else {
        toast.info('Blog unpublished. Retracted to draft mode.');
      }
    } catch (err) {
      console.error('Publish toggle error:', err);
      toast.error('Failed to change publication status.');
    }
  };

  const handleDeleteClick = (blogId) => {
    setBlogIdToDelete(blogId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blogIdToDelete) return;
    try {
      await api.delete(`posts/${blogIdToDelete}/`);
      setBlogs((prev) => prev.filter((b) => b.id !== blogIdToDelete));
      toast.success('Blog post deleted successfully.');
      setIsDeleteModalOpen(false);
      setBlogIdToDelete(null);
    } catch (err) {
      console.error('Delete blog error:', err);
      toast.error('Failed to delete blog post.');
    }
  };

  const placeholderImage = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80';

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header */}
          <div className="border-b border-gray-150 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-955">My Workspace</h2>
              <p className="mt-1.5 text-sm font-semibold text-gray-400">Write, edit, delete, and control publication statuses of your posts.</p>
            </div>
            <Link
              to="/create-blog"
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all btn-active-press"
            >
              <Plus className="h-5 w-5" />
              <span>Create Blog</span>
            </Link>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-155 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <SearchBar search={search} setSearch={setSearch} placeholder="Search my blogs..." />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                aria-label="Filter status"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent outline-none cursor-pointer font-bold text-gray-805"
              >
                <option value="all">All Blogs</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="space-y-4">
              <Skeleton variant="list" count={3} />
            </div>
          ) : error ? (
            <p className="text-sm font-bold text-red-650 text-center py-6">{error}</p>
          ) : blogs.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 mb-5 shadow-inner">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-gray-955">No blogs found</h3>
              <p className="mt-2 text-sm text-gray-400 font-semibold max-w-sm leading-relaxed">
                You haven't written any posts matching the filters or query. Get writing to share your tech insights!
              </p>
              <Link
                to="/create-blog"
                className="mt-5 rounded-xl bg-indigo-600 px-5.5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-705 transition-colors btn-active-press"
              >
                Create First Post
              </Link>
            </div>
          ) : (
            /* List Grid */
            <div className="grid gap-6 animate-fade-in">
              {blogs.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-gray-150 bg-white p-4 shadow-sm items-center sm:items-stretch hover:shadow-md transition-shadow duration-300"
                >
                  {/* cover image */}
                  <img
                    src={b.image_display_url || placeholderImage}
                    alt={b.title}
                    className="h-28 w-44 rounded-xl object-cover border border-gray-100 shrink-0 shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderImage;
                    }}
                  />

                  {/* Body details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1 text-center sm:text-left gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                          {b.category_name}
                        </span>
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-1">
                          {b.published ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                              <CheckCircle className="h-3 w-3" />
                              <span>Published</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-705 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                              <Clock className="h-3 w-3" />
                              <span>Draft</span>
                            </span>
                          )}
                        </span>
                      </div>

                      <Link to={`/blogs/${b.id}`} className="block hover:text-indigo-600 transition-colors">
                        <h3 className="text-base font-black text-gray-950 truncate">{b.title}</h3>
                      </Link>
                      <p className="text-xs text-gray-400 font-semibold truncate leading-relaxed max-w-xl">
                        {b.summary}
                      </p>
                    </div>

                    {/* Actions toolbar */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      
                      {/* View Details */}
                      <Link
                        to={`/blogs/${b.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-250 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </Link>

                      {/* Edit Button */}
                      <Link
                        to={`/edit-blog/${b.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-250 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-650 hover:border-indigo-200 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>

                      {/* Publish/Unpublish toggle */}
                      <button
                        onClick={() => handlePublishToggle(b.id, b.published)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors btn-active-press ${
                          b.published
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {b.published ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Publish</span>
                          </>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteClick(b.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-250 bg-white px-3 py-1.5 text-xs font-bold text-gray-755 hover:bg-red-50 hover:text-red-650 hover:border-red-200 transition-colors btn-active-press"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>

                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this blog post? All associated comments and likes will be lost."
      />
    </div>
  );
};

export default MyBlogs;
