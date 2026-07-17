import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Clock, Heart, MessageSquare, Bookmark, Share2 } from 'lucide-react';

const BlogCard = ({ blog, onBookmarkToggle }) => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [isBookmarked, setIsBookmarked] = useState(blog.is_bookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(blog.bookmarks_count || 0);
  const [togglingBookmark, setTogglingBookmark] = useState(false);

  const placeholderImage = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80';
  const displayImage = blog.image_display_url || placeholderImage;

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warning('Please log in to bookmark articles.');
      navigate('/login');
      return;
    }

    if (togglingBookmark) return;
    setTogglingBookmark(true);

    try {
      const response = await api.post(`posts/${blog.id}/bookmark/`);
      const { is_bookmarked } = response.data;
      setIsBookmarked(is_bookmarked);
      setBookmarkCount((prev) => is_bookmarked ? prev + 1 : Math.max(0, prev - 1));
      
      if (is_bookmarked) {
        toast.success('Added to bookmarks!');
      } else {
        toast.info('Removed from bookmarks.');
      }

      if (onBookmarkToggle) {
        onBookmarkToggle(blog.id, is_bookmarked);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      toast.error('Failed to toggle bookmark.');
    } finally {
      setTogglingBookmark(false);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const blogUrl = `${window.location.origin}/blogs/${blog.id}`;
    navigator.clipboard.writeText(blogUrl)
      .then(() => {
        toast.success('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Share error:', err);
        toast.error('Failed to copy link.');
      });
  };

  const formattedDate = new Date(blog.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full">
      <div>
        
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={displayImage}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderImage;
            }}
          />
          <div className="absolute top-4 left-4">
            <span className="inline-block rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-xs font-black text-indigo-700 shadow-sm border border-indigo-50 uppercase tracking-wider">
              {blog.category_name}
            </span>
          </div>

          <div className="absolute top-4 right-4 flex gap-1.5">
            {/* Share btn */}
            <button
              onClick={handleShareClick}
              aria-label="Share post"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 backdrop-blur-md text-gray-500 hover:text-indigo-650 shadow-sm border border-gray-100 hover:bg-white transition-all btn-active-press"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {/* Bookmark btn */}
            <button
              onClick={handleBookmarkClick}
              aria-label="Bookmark post"
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 hover:bg-white transition-all btn-active-press ${
                isBookmarked ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
              }`}
            >
              <Bookmark className="h-4.5 w-4.5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold mb-2.5">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{blog.reading_time || '1 min read'}</span>
            </span>
            <span>&bull;</span>
            <span>{formattedDate}</span>
          </div>

          <Link to={`/blogs/${blog.id}`} className="hover:text-indigo-600 transition-colors">
            <h3 className="text-lg font-black text-gray-950 line-clamp-2 leading-snug">
              {blog.title}
            </h3>
          </Link>

          <p className="mt-2 text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
            {blog.summary}
          </p>
        </div>

      </div>

      {/* Card Footer */}
      <div className="border-t border-gray-50 p-5 pt-4 flex items-center justify-between">
        
        {/* Author details */}
        <Link
          to={`/authors/${blog.author}`}
          className="flex items-center gap-2 group/author hover:opacity-90 transition-opacity"
        >
          <img
            src={blog.author_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=60'}
            alt={blog.author_name}
            className="h-7 w-7 rounded-full object-cover border border-gray-200"
          />
          <span className="text-xs font-bold text-gray-700 group-hover/author:text-indigo-600 transition-colors">
            {blog.author_name}
          </span>
        </Link>

        {/* Likes and comments counts */}
        <div className="flex items-center gap-3.5 text-xs text-gray-400 font-bold">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{blog.likes_count}</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>{blog.comment_count}</span>
          </span>
        </div>

      </div>

    </article>
  );
};

export default BlogCard;
