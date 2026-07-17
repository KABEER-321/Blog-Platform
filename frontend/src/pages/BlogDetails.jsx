import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CommentCard from '../components/CommentCard';
import Skeleton from '../components/Skeleton';
import MarkdownRenderer from '../components/MarkdownRenderer';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { Clock, Heart, MessageSquare, Bookmark, Share2, ArrowLeft, Send } from 'lucide-react';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  // Blog Details state
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Likes & Bookmarks state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const [detailRes, relatedRes, commentsRes] = await Promise.all([
          api.get(`posts/${id}/`),
          api.get(`posts/${id}/related/`),
          api.get(`posts/${id}/comments/`)
        ]);

        setBlog(detailRes.data);
        setIsLiked(detailRes.data.is_liked);
        setLikesCount(detailRes.data.likes_count);
        setIsBookmarked(detailRes.data.is_bookmarked);
        
        setRelatedBlogs(relatedRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        console.error('Error fetching blog details:', err);
        setError('Failed to load blog details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetails();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast.warning('Please log in to like this article.');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`posts/${id}/like/`);
      setIsLiked(response.data.is_liked);
      setLikesCount(response.data.likes_count);
      if (response.data.is_liked) {
        toast.success('Liked article!');
      } else {
        toast.info('Removed like.');
      }
    } catch (err) {
      console.error('Like error:', err);
      toast.error('Failed to update like status.');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.warning('Please log in to bookmark this article.');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`posts/${id}/bookmark/`);
      setIsBookmarked(response.data.is_bookmarked);
      if (response.data.is_bookmarked) {
        toast.success('Added to bookmarks!');
      } else {
        toast.info('Removed from bookmarks.');
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      toast.error('Failed to update bookmark.');
    }
  };

  const handleShareClick = () => {
    const blogUrl = window.location.href;
    navigator.clipboard.writeText(blogUrl)
      .then(() => {
        toast.success('Blog link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Share error:', err);
        toast.error('Failed to copy link.');
      });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    if (!user) {
      toast.warning('Please log in to add comments.');
      navigate('/login');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await api.post(`posts/${id}/comments/`, {
        comment: newComment.trim()
      });
      // Prepend to display newest first
      setComments((prev) => [response.data, ...prev]);
      setNewComment('');
      toast.success('Comment posted successfully!');
    } catch (err) {
      console.error('Add comment error:', err);
      toast.error('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId, updatedText) => {
    try {
      const response = await api.put(`comments/${commentId}/`, {
        comment: updatedText
      });
      setComments((prev) => prev.map((c) => (c.id === commentId ? response.data : c)));
      toast.success('Comment updated successfully.');
      return true;
    } catch (err) {
      console.error('Edit comment error:', err);
      toast.error('Failed to save comment edit.');
      return false;
    }
  };

  const handleDeleteCommentClick = (commentId) => {
    setCommentIdToDelete(commentId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentIdToDelete) return;
    try {
      await api.delete(`comments/${commentIdToDelete}/`);
      setComments((prev) => prev.filter((c) => c.id !== commentIdToDelete));
      toast.success('Comment deleted.');
      setIsDeleteModalOpen(false);
      setCommentIdToDelete(null);
    } catch (err) {
      console.error('Delete comment error:', err);
      toast.error('Failed to delete comment.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton variant="details" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md py-20 text-center px-4">
          <p className="text-red-700 font-bold mb-5">{error || 'Article not found.'}</p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white btn-active-press shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Feed</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const placeholderImage = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80';
  const displayImage = blog.image_display_url || placeholderImage;

  const formattedDate = new Date(blog.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          {/* Back link */}
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-650 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Articles</span>
          </Link>

          {/* Blog Details Header Card */}
          <article className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
            
            {/* Banner Cover Image */}
            <div className="relative h-[250px] sm:h-[350px] w-full overflow-hidden bg-gray-100">
              <img
                src={displayImage}
                alt={blog.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = placeholderImage;
                }}
              />
              <div className="absolute top-6 left-6">
                <span className="inline-block rounded-xl bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-black text-indigo-700 shadow border border-indigo-50 uppercase tracking-widest">
                  {blog.category_name}
                </span>
              </div>
            </div>

            {/* Header Content */}
            <div className="p-6 sm:p-8 border-b border-gray-100 space-y-4">
              <div className="flex items-center gap-2.5 text-xs text-gray-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{blog.reading_time || '1 min read'}</span>
                </span>
                <span>&bull;</span>
                <span>Published on {formattedDate}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-950 font-serif-display leading-tight">
                {blog.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-500 font-bold leading-relaxed italic">
                {blog.summary}
              </p>

              {/* Author & Interactions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-50">
                
                {/* Author profile link card */}
                <Link to={`/authors/${blog.author}`} className="flex items-center gap-3 group">
                  <img
                    src={blog.author_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={blog.author_name}
                    className="h-10 w-10 rounded-full object-cover border border-gray-250 shrink-0"
                  />
                  <div>
                    <div className="text-sm font-black text-gray-950 group-hover:text-indigo-600 transition-colors">
                      {blog.author_name}
                    </div>
                    <div className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Spherical Contributor</div>
                  </div>
                </Link>

                {/* Engagement actions toolbar */}
                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button
                    onClick={handleLikeToggle}
                    className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all btn-active-press ${
                      isLiked 
                        ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-sm' 
                        : 'bg-white border-gray-250 text-gray-550 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likesCount} Likes</span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={handleBookmarkToggle}
                    aria-label="Bookmark post"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all btn-active-press ${
                      isBookmarked
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-650'
                        : 'bg-white border-gray-250 text-gray-550 hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark className="h-4.5 w-4.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShareClick}
                    aria-label="Share article"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-250 bg-white text-gray-550 hover:bg-gray-50 transition-all btn-active-press"
                  >
                    <Share2 className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>

            </div>

            {/* Markdown Body Content container */}
            <div className="p-6 sm:p-8">
              <MarkdownRenderer content={blog.content} />
            </div>

          </article>

          {/* Related Posts Panel */}
          {relatedBlogs.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-black text-gray-950 font-serif-display border-b border-gray-150 pb-2.5">
                Related Articles
              </h3>
              <div className="grid gap-6 sm:grid-cols-3">
                {relatedBlogs.map((rel) => {
                  const relImg = rel.image_display_url || placeholderImage;
                  return (
                    <Link
                      key={rel.id}
                      to={`/blogs/${rel.id}`}
                      className="group flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={relImg}
                          alt={rel.title}
                          className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h4 className="text-xs font-black text-indigo-650 uppercase tracking-wider mb-1.5">{rel.category_name}</h4>
                        <h5 className="text-sm font-black text-gray-950 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                          {rel.title}
                        </h5>
                        <div className="text-[10px] text-gray-400 font-bold mt-3">By {rel.author_name}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Comments Panel */}
          <section className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-955 flex items-center gap-2 border-b border-gray-100 pb-3.5">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <span>Comments ({comments.length})</span>
            </h3>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-3 items-start">
              <img
                src={user?.user.profile?.profile_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                alt="Your avatar"
                className="h-9 w-9 rounded-full object-cover border border-gray-200 shrink-0 mt-1"
              />
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  disabled={submittingComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Write a response..." : "Please log in to participate in comments..."}
                  readOnly={!user}
                  rows="3"
                  className="w-full rounded-xl border border-gray-250 bg-gray-50/50 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
                />
                
                {user && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-705 transition-colors btn-active-press disabled:bg-indigo-400"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{submittingComment ? 'Sending...' : 'Post Comment'}</span>
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="py-8 text-center text-sm font-bold text-gray-400 border-t border-gray-50">
                No comments exist yet. Be the first to start the conversation!
              </div>
            ) : (
              <div className="border-t border-gray-100 divide-y divide-gray-100 max-h-[450px] overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteCommentClick}
                  />
                ))}
              </div>
            )}

          </section>
        </main>
      </div>

      <Footer />

      {/* Delete Comment Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteComment}
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
    </div>
  );
};

export default BlogDetails;
