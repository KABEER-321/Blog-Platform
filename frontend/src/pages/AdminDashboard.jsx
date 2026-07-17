import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Skeleton from '../components/Skeleton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  FolderHeart,
  FolderOpen
} from 'lucide-react';

const AdminDashboard = () => {
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [activeAuthors, setActiveAuthors] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  
  // Category management states
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  // Category delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [catIdToDelete, setCatIdToDelete] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, catsRes] = await Promise.all([
        api.get('admin/dashboard/'),
        api.get('categories/')
      ]);

      setStats(dashRes.data.stats);
      setActiveAuthors(dashRes.data.active_authors);
      setRecentUsers(dashRes.data.recent_users);
      setRecentBlogs(dashRes.data.recent_blogs);
      setRecentComments(dashRes.data.recent_comments);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.isNetworkError ? err.message : 'Failed to retrieve admin panel metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim() || submittingCat) return;

    setSubmittingCat(true);
    try {
      if (editingCatId) {
        // Edit Category
        const response = await api.put(`categories/${editingCatId}/`, {
          name: catName.trim(),
          description: catDesc.trim()
        });
        setCategories((prev) => prev.map((c) => (c.id === editingCatId ? response.data : c)));
        toast.success('Category updated successfully!');
        setEditingCatId(null);
      } else {
        // Create Category
        const response = await api.post('categories/', {
          name: catName.trim(),
          description: catDesc.trim()
        });
        setCategories((prev) => [...prev, response.data]);
        toast.success('New category created successfully!');
      }

      setCatName('');
      setCatDesc('');
    } catch (err) {
      console.error('Category save error:', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const mainError = Object.values(errorData)[0];
        toast.error(Array.isArray(mainError) ? mainError[0] : mainError);
      } else {
        toast.error('Failed to save category.');
      }
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleEditCatClick = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setCatName('');
    setCatDesc('');
  };

  const handleDeleteCatClick = (id) => {
    setCatIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!catIdToDelete) return;
    try {
      await api.delete(`categories/${catIdToDelete}/`);
      setCategories((prev) => prev.filter((c) => c.id !== catIdToDelete));
      toast.success('Category deleted successfully.');
      setIsDeleteModalOpen(false);
      setCatIdToDelete(null);
    } catch (err) {
      console.error('Category delete error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Failed to delete category.');
      }
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <Skeleton variant="stats" count={5} />
          </div>
          <div className="h-64 rounded-3xl bg-white border border-gray-150 animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Users',
      value: stats?.total_users,
      icon: Users,
      color: 'text-indigo-650',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100/85',
    },
    {
      label: 'Total Blogs',
      value: stats?.total_blogs,
      icon: FileText,
      color: 'text-sky-655',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-100/85',
    },
    {
      label: 'Published Blogs',
      value: stats?.published_blogs,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100/85',
    },
    {
      label: 'Draft Blogs',
      value: stats?.draft_blogs,
      icon: Clock,
      color: 'text-amber-605',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100/85',
    },
    {
      label: 'Total Comments',
      value: stats?.total_comments,
      icon: MessageSquare,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100/85',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-gray-150 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-955">Admin Dashboard</h2>
              <p className="mt-1.5 text-sm font-semibold text-gray-400">Manage categories, audit articles, comments, and monitor active users.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-emerald-650" />
              <span>Real-time platform metrics</span>
            </div>
          </div>

          {/* KPI Widget Cards */}
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((k, idx) => {
              const Icon = k.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-5 rounded-2xl border ${k.borderColor} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${k.bgColor} ${k.color}`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <p className="text-xxs font-black uppercase tracking-wider text-gray-405">{k.label}</p>
                    <h3 className="mt-1 text-2xl font-black text-gray-950 leading-none">{k.value}</h3>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Main Grid Workspace */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            
            {/* Category manager */}
            <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-gray-955 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FolderHeart className="h-5 w-5 text-indigo-600" />
                <span>{editingCatId ? 'Edit Category' : 'Create Category'}</span>
              </h3>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label htmlFor="cat-name" className="text-xs font-bold uppercase tracking-wider text-gray-450 block mb-1">
                    Category Name
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Cyber Security"
                    className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
                  />
                </div>

                <div>
                  <label htmlFor="cat-desc" className="text-xs font-bold uppercase tracking-wider text-gray-450 block mb-1">
                    Description
                  </label>
                  <textarea
                    id="cat-desc"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Description of category topics..."
                    rows="3"
                    className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-700"
                  />
                </div>

                <div className="flex gap-2">
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full rounded-xl border border-gray-250 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submittingCat || !catName.trim()}
                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-705 transition-colors btn-active-press disabled:bg-indigo-400"
                  >
                    {submittingCat ? 'Saving...' : editingCatId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>

              {/* Categories list table */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <FolderOpen className="h-4 w-4" />
                  <span>Existing Categories</span>
                </h4>

                <div className="max-h-[220px] overflow-y-auto pr-1 divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center py-2">
                      <div className="min-w-0">
                        <span className="text-sm font-black text-gray-950 block truncate">{cat.name}</span>
                        <span className="text-xxs text-gray-400 font-semibold uppercase">{cat.post_count} published blogs</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCatClick(cat)}
                          aria-label="Edit category"
                          className="p-1 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-650"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCatClick(cat.id)}
                          aria-label="Delete category"
                          className="p-1 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-650"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column: Activity lists */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Authors list */}
              <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-lg font-black text-gray-955 border-b border-gray-100 pb-2.5">
                  Most Active Authors
                </h3>
                <div className="divide-y divide-gray-100">
                  {activeAuthors.map((author) => (
                    <div key={author.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <div className="text-sm font-black text-gray-950">{author.name}</div>
                        <div className="text-xs text-gray-400 font-semibold">{author.email}</div>
                      </div>
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700 border border-indigo-100">
                        {author.posts_count} Articles
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users & Blogs table grids */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Recent signups */}
                <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-black text-gray-955 border-b border-gray-100 pb-2">
                    Recent User Signups
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {recentUsers.map((u) => (
                      <div key={u.id} className="py-2">
                        <div className="text-xs font-black text-gray-950 truncate">{u.name}</div>
                        <div className="text-xxs text-gray-400 truncate">{u.email}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent blogs */}
                <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-black text-gray-955 border-b border-gray-100 pb-2">
                    Recent Blogs
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {recentBlogs.map((b) => (
                      <div key={b.id} className="py-2">
                        <Link to={`/blogs/${b.id}`} className="hover:text-indigo-650">
                          <h4 className="text-xs font-black text-gray-950 truncate leading-snug">{b.title}</h4>
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xxs font-bold text-gray-400">
                          <span>By {b.author}</span>
                          <span>&bull;</span>
                          <span className={b.published ? 'text-emerald-700' : 'text-amber-700'}>
                            {b.published ? 'Pub' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Recent comments auditing list */}
              <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-gray-955 border-b border-gray-100 pb-2">
                  Recent Comments Activity
                </h3>
                <div className="divide-y divide-gray-100">
                  {recentComments.map((c) => (
                    <div key={c.id} className="py-3 flex flex-col gap-1 text-xs">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-black text-gray-950">{c.user_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-500 font-semibold italic">"{c.comment}"</p>
                      <div className="text-[10px] text-gray-450 font-bold mt-0.5">
                        On article: <span className="text-indigo-600 font-extrabold">{c.post_title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      <Footer />

      {/* Delete Category Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteCategory}
        message="Are you sure you want to delete this category? This will fail if there are active posts belonging to it."
      />
    </div>
  );
};

export default AdminDashboard;
