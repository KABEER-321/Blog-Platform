import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import Skeleton from '../components/Skeleton';
import { Bookmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('bookmarks/');
      setBookmarks(response.data);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err.isNetworkError ? err.message : 'Failed to load your bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleBookmarkToggle = (postId, isBookmarked) => {
    // If user unbookmarked a post from this page, filter it out immediately for interactive feel
    if (!isBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.post_details?.id !== postId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="border-b border-gray-150 pb-6 mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-955">Bookmarked Articles</h2>
              <p className="mt-1.5 text-sm font-semibold text-gray-400">Your curated collection of reading bookmarks.</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-black text-indigo-650 uppercase tracking-widest bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Library</span>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton variant="card" count={3} />
            </div>
          ) : error ? (
            <p className="text-sm font-bold text-red-650 text-center py-6">{error}</p>
          ) : bookmarks.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm max-w-lg mx-auto animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 mb-5 shadow-inner">
                <Bookmark className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-gray-955">No bookmarks yet</h3>
              <p className="mt-2 text-sm text-gray-400 font-semibold max-w-sm leading-relaxed">
                You haven't bookmarked any stories yet. Explore the blogs feed and tap the bookmark icon to save links here.
              </p>
              <Link
                to="/blogs"
                className="mt-6 rounded-xl bg-indigo-600 px-5.5 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-705 transition-colors btn-active-press"
              >
                Go Read Blogs
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
              {bookmarks.map((bookmark) => {
                const blog = bookmark.post_details;
                if (!blog) return null;
                return (
                  <div key={bookmark.id} className="h-full">
                    <BlogCard blog={blog} onBookmarkToggle={handleBookmarkToggle} />
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Bookmarks;
