import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import Skeleton from '../components/Skeleton';
import { BookOpen, TrendingUp, Sparkles, FolderHeart, ArrowRight } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      setError('');
      try {
        const [catsRes, postsRes] = await Promise.all([
          api.get('categories/'),
          api.get('posts/', { params: { published: 'true', sort_by: 'newest' } })
        ]);
        
        setCategories(catsRes.data);
        
        const allPosts = postsRes.data;
        if (allPosts.length > 0) {
          // Featured post: most commented/newest (sort by comment count then newest)
          const sortedByComments = [...allPosts].sort((a, b) => b.comment_count - a.comment_count);
          setFeaturedPost(sortedByComments[0]);

          // Latest posts: newest 3 published posts
          setLatestPosts(allPosts.slice(0, 3));

          // Trending posts: top 3 sorted by likes count
          const sortedByLikes = [...allPosts].sort((a, b) => b.likes_count - a.likes_count);
          setTrendingPosts(sortedByLikes.slice(0, 4));
        }
      } catch (err) {
        console.error('Error loading home data:', err);
        setError(err.isNetworkError ? err.message : 'Failed to retrieve home feed content.');
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const placeholderImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-black text-indigo-300 uppercase tracking-widest border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore Tech Insights</span>
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none font-serif-display max-w-3xl mx-auto">
              Your Hub for Developer Wisdom &amp; Code Crafts
            </h1>
            <p className="text-base sm:text-lg text-indigo-200/90 font-medium max-w-xl mx-auto leading-relaxed">
              Read advanced articles on programming, system architectures, frontend optimization, cloud systems, and career advice.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/blogs"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all btn-active-press"
              >
                Browse All Blogs
              </Link>
              {localStorage.getItem('access_token') ? (
                <Link
                  to="/create-blog"
                  className="rounded-xl border border-indigo-400/40 bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all btn-active-press"
                >
                  Write an Article
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="rounded-xl border border-indigo-400/40 bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all btn-active-press"
                >
                  Become an Author
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Home Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
          
          {loading ? (
            <div className="space-y-12">
              <div className="h-[300px] w-full rounded-3xl bg-gray-200 animate-pulse" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton variant="card" count={3} />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center shadow-sm max-w-lg mx-auto">
              <p className="text-red-850 font-bold">{error}</p>
            </div>
          ) : (
            <>
              {/* Featured Post Card */}
              {featuredPost && (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-150 pb-3">
                    <Sparkles className="h-5 w-5 text-indigo-650 shrink-0" />
                    <h2 className="text-xl font-black text-gray-950 uppercase tracking-wider text-sm">Featured Article</h2>
                  </div>
                  
                  <div className="grid gap-6 lg:grid-cols-2 items-center rounded-3xl border border-gray-150 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="aspect-video lg:aspect-square xl:aspect-video w-full rounded-2xl overflow-hidden bg-gray-100">
                      <img
                        src={featuredPost.image_display_url || placeholderImage}
                        alt={featuredPost.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = placeholderImage;
                        }}
                      />
                    </div>
                    
                    <div className="flex flex-col justify-between h-full py-2 space-y-4">
                      <div className="space-y-3">
                        <span className="inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                          {featuredPost.category_name}
                        </span>
                        
                        <Link to={`/blogs/${featuredPost.id}`} className="hover:text-indigo-600 transition-colors block">
                          <h3 className="text-2xl sm:text-3xl font-black text-gray-950 font-serif-display leading-tight">
                            {featuredPost.title}
                          </h3>
                        </Link>
                        
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                          {featuredPost.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-50 pt-4 flex-wrap gap-3">
                        <Link to={`/authors/${featuredPost.author}`} className="flex items-center gap-2 group">
                          <img
                            src={featuredPost.author_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=60'}
                            alt={featuredPost.author_name}
                            className="h-8 w-8 rounded-full object-cover border border-gray-200"
                          />
                          <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-605 transition-colors">
                            {featuredPost.author_name}
                          </span>
                        </Link>
                        
                        <Link
                          to={`/blogs/${featuredPost.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-705 transition-colors btn-active-press"
                        >
                          <span>Read Full Article</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Dynamic Categories widget */}
              {categories.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-150 pb-3">
                    <FolderHeart className="h-5 w-5 text-indigo-650 shrink-0" />
                    <h2 className="text-xl font-black text-gray-950 uppercase tracking-wider text-sm">Popular Categories</h2>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {categories.slice(0, 8).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/blogs?category=${cat.id}`}
                        className="flex items-center gap-2.5 rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/20 hover:text-indigo-650 transition-all btn-active-press"
                      >
                        <span>{cat.name}</span>
                        <span className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-xxs font-black text-gray-400">
                          {cat.post_count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Latest Blogs Feed */}
              {latestPosts.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-650 shrink-0" />
                      <h2 className="text-xl font-black text-gray-950 uppercase tracking-wider text-sm">Latest Articles</h2>
                    </div>
                    <Link
                      to="/blogs"
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>See All Articles</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {latestPosts.map((blog) => (
                      <div key={blog.id} className="h-full">
                        <BlogCard blog={blog} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending Posts widget */}
              {trendingPosts.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-150 pb-3">
                    <TrendingUp className="h-5 w-5 text-indigo-650 shrink-0" />
                    <h2 className="text-xl font-black text-gray-955 uppercase tracking-wider text-sm">Trending Stories</h2>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {trendingPosts.map((post, idx) => (
                      <Link
                        key={post.id}
                        to={`/blogs/${post.id}`}
                        className="group p-4 bg-white border border-gray-150 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4"
                      >
                        <span className="text-3xl font-black text-indigo-100 group-hover:text-indigo-600 transition-colors leading-none shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="space-y-1.5">
                          <span className="inline-block text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                            {post.category_name}
                          </span>
                          <h4 className="text-sm font-black text-gray-950 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                            {post.title}
                          </h4>
                          <span className="block text-[10px] font-semibold text-gray-400">
                            By {post.author_name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

            </>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
