import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import SortDropdown from '../components/SortDropdown';
import BlogCard from '../components/BlogCard';
import Skeleton from '../components/Skeleton';
import { FileText, Sparkles } from 'lucide-react';

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('newest');

  // Sync category if URL updates
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) {
      setSelectedCategory(Number(urlCat) || urlCat);
    } else {
      setSelectedCategory('All');
    }
  }, [searchParams]);

  // Load categories and initial posts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('categories/');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        published: 'true', // Only show published blogs
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort_by: sortBy,
      };

      const response = await api.get('posts/', { params });
      setBlogs(response.data);
    } catch (err) {
      console.error('Error loading blogs:', err);
      setError(err.isNetworkError ? err.message : 'Failed to retrieve blog feed.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sortBy]);

  // Trigger fetch with search debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBlogs();
    }, 150);
    return () => clearTimeout(delayDebounce);
  }, [fetchBlogs]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="border-b border-gray-150 pb-6 mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-955">Blog Feed</h2>
              <p className="mt-1.5 text-sm font-semibold text-gray-400">Discover articles, coding tutorials, and industry insights.</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-black text-indigo-650 uppercase tracking-widest bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sphere Stories</span>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row items-start">
            
            {/* Left Column: Category Filter */}
            <div className="w-full lg:w-64 shrink-0">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
              <button
                onClick={handleClearFilters}
                className="w-full mt-3 rounded-xl border border-gray-250 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 btn-active-press shadow-sm"
              >
                Clear All Filters
              </button>
            </div>

            {/* Right Column: Feeds & Search toolbar */}
            <div className="w-full flex-1 space-y-6">
              
              {/* Toolbar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                  <SearchBar search={search} setSearch={setSearch} placeholder="Search title, summary, author..." />
                </div>
                <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
              </div>

              {/* Grid Feed list */}
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Skeleton variant="card" count={4} />
                </div>
              ) : error ? (
                <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
                  <p className="text-red-800 font-bold">{error}</p>
                  <button
                    onClick={fetchBlogs}
                    className="mt-4 rounded-xl bg-red-650 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 btn-active-press"
                  >
                    Retry Fetch
                  </button>
                </div>
              ) : blogs.length === 0 ? (
                /* Empty state */
                <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm animate-fade-in">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 mb-5 shadow-inner">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black text-gray-950">No Search Results</h3>
                  <p className="mt-2 text-sm text-gray-400 font-semibold max-w-sm leading-relaxed">
                    We couldn't find any articles matching your query or selected category. Try expanding your search.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-5 rounded-xl border border-gray-250 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 btn-active-press"
                  >
                    Reset Filter Parameters
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="h-full">
                      <BlogCard blog={blog} />
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Blogs;
