import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import Skeleton from '../components/Skeleton';
import { ArrowLeft, User, FileText, CheckCircle2 } from 'lucide-react';

const Author = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [author, setAuthor] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`authors/${id}/`);
        setAuthor(response.data.author);
        setStats(response.data.stats);
        setPosts(response.data.posts);
      } catch (err) {
        console.error('Error fetching author profile:', err);
        setError('Failed to load author profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAuthorProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <div className="h-44 rounded-3xl bg-gray-200 animate-pulse" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton variant="card" count={3} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md py-20 text-center px-4">
          <p className="text-red-700 font-bold mb-5">{error || 'Author profile not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow btn-active-press"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const placeholderAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
  const avatarUrl = author.profile?.profile_image_url || placeholderAvatar;

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-650 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>

          {/* Author Profile Card */}
          <section className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <img
              src={avatarUrl}
              alt={author.name}
              className="h-24 w-24 rounded-full object-cover border border-gray-200 shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholderAvatar;
              }}
            />
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-black text-gray-955">{author.name}</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Author &amp; Contributor</p>
              </div>

              <p className="text-sm text-gray-650 font-medium leading-relaxed max-w-2xl">
                {author.profile?.bio || 'This author has not updated their bio yet.'}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xxs text-gray-450 font-bold uppercase tracking-wider">Total Blogs</div>
                    <div className="text-base font-black text-gray-900 leading-none mt-0.5">{stats?.total_blogs || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xxs text-gray-450 font-bold uppercase tracking-wider">Published Blogs</div>
                    <div className="text-base font-black text-gray-900 leading-none mt-0.5">{stats?.published_blogs || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Author Published Blogs Grid list */}
          <section className="space-y-6">
            <h3 className="text-lg font-black text-gray-950 font-serif-display border-b border-gray-150 pb-2.5">
              Articles by {author.name}
            </h3>

            {posts.length === 0 ? (
              <p className="text-sm font-semibold text-gray-400 text-center py-12 bg-white border border-dashed border-gray-200 rounded-3xl">
                This author hasn't published any stories yet.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((blog) => (
                  <div key={blog.id} className="h-full">
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Author;
