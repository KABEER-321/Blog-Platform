import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FileText, ArrowLeft, Image, Link2, Settings, Tag } from 'lucide-react';

const CreateBlog = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  
  // Image properties
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (titleInputRef.current) titleInputRef.current.focus();
  }, []);

  // Fetch categories list
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('categories/');
        setCategories(response.data);
        if (response.data.length > 0) {
          setCategoryId(response.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!title.trim()) tempErrors.title = 'Title is required.';
    if (!categoryId) tempErrors.category = 'Category selection is required.';
    if (!summary.trim()) tempErrors.summary = 'Summary description is required.';
    if (!content.trim()) tempErrors.content = 'Blog content body is required.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', categoryId);
      formData.append('summary', summary.trim());
      formData.append('content', content.trim());
      formData.append('published', published);
      formData.append('image_url', imageUrl.trim());

      if (imageFile) {
        formData.append('featured_image', imageFile);
      }

      await api.post('posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(published ? 'Blog post published successfully!' : 'Draft saved successfully!');
      navigate('/my-blogs');
    } catch (err) {
      console.error('Error creating blog:', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const formattedErrors = {};
        Object.keys(errorData).forEach(key => {
          formattedErrors[key] = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
        });
        setErrors(formattedErrors);
        toast.error('Failed to save. Please resolve form errors.');
      } else {
        toast.error('Failed to create blog post.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          {/* Back link */}
          <Link
            to="/my-blogs"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-650 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel and return</span>
          </Link>

          <div className="rounded-3xl border border-gray-150 bg-white p-6 sm:p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-black text-gray-955 border-b border-gray-100 pb-3.5 mb-6">Create New Article</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Title */}
              <div>
                <label htmlFor="crt-title" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  <span>Blog Title</span>
                </label>
                <input
                  id="crt-title"
                  ref={titleInputRef}
                  type="text"
                  disabled={loading}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Navigating CORS in Django and React"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                    errors.title ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.title}</p>}
              </div>

              {/* Category selector */}
              <div>
                <label htmlFor="crt-cat" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                  <Tag className="h-3.5 w-3.5 text-gray-400" />
                  <span>Blog Category</span>
                </label>
                <select
                  id="crt-cat"
                  value={categoryId}
                  disabled={loading}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.category}</p>}
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="crt-sum" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  <span>Short Summary</span>
                </label>
                <input
                  id="crt-sum"
                  type="text"
                  disabled={loading}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provide a brief, catchy 1-2 sentence description..."
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                    errors.summary ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                {errors.summary && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.summary}</p>}
              </div>

              {/* Image upload parameters */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-gray-50">
                <div>
                  <label htmlFor="crt-file" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                    <Image className="h-3.5 w-3.5 text-gray-400" />
                    <span>Upload Local Image Cover</span>
                  </label>
                  <input
                    id="crt-file"
                    type="file"
                    accept="image/*"
                    disabled={loading}
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-3 relative h-20 w-32 rounded-xl overflow-hidden border border-gray-200">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="crt-url" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-455 mb-1.5">
                    <Link2 className="h-3.5 w-3.5 text-gray-400" />
                    <span>Or Provide Image URL</span>
                  </label>
                  <input
                    id="crt-url"
                    type="url"
                    disabled={loading}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
                  />
                </div>
              </div>

              {/* Content body textarea */}
              <div className="pt-2 border-t border-gray-50">
                <label htmlFor="crt-content" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  <span>Blog Content (Supports Markdown)</span>
                </label>
                <textarea
                  id="crt-content"
                  value={content}
                  disabled={loading}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Design Patterns in Modern Development..."
                  rows="12"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all font-mono ${
                    errors.content ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                {errors.content && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.content}</p>}
              </div>

              {/* Publication toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
                <div>
                  <h4 className="text-sm font-black text-gray-950 flex items-center gap-1.5">
                    <Settings className="h-4 w-4 text-gray-405" />
                    <span>Publication Status</span>
                  </h4>
                  <p className="text-xs text-gray-450 font-semibold mt-0.5">Toggle to publish directly or save as a draft first.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Link
                  to="/my-blogs"
                  className="rounded-xl border border-gray-250 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-55 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700 transition-colors btn-active-press disabled:bg-indigo-400"
                >
                  {loading ? 'Saving...' : published ? 'Publish Blog' : 'Save as Draft'}
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CreateBlog;
