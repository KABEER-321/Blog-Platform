import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Skeleton from '../components/Skeleton';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  ClipboardList,
  Clock,
  Heart,
  MessageSquare,
  FileText,
  CheckCircle,
  Settings,
  ChevronRight
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, loading, refreshProfile } = useAuth();
  const toast = useToast();

  // Form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync profile data on user load
  useEffect(() => {
    if (user) {
      setName(user.user.name || '');
      setPhone(user.user.profile?.phone || '');
      setBio(user.user.profile?.bio || '');
      setImagePreview(user.user.profile?.profile_image_url || '');
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Name is required.';
    }

    if (phone.trim()) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 8) {
        errors.phone = 'Please enter a valid phone number (minimum 8 digits).';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUpdating) return;

    if (!validateForm()) return;

    setIsUpdating(true);
    const result = await updateProfile(name, phone, bio, profileImage);
    setIsUpdating(false);

    if (result.success) {
      toast.success('Profile settings updated successfully!');
      // Clear file selector state
      setProfileImage(null);
    } else {
      if (result.errors) {
        const backendErrors = {};
        Object.keys(result.errors).forEach((key) => {
          backendErrors[key] = Array.isArray(result.errors[key]) ? result.errors[key][0] : result.errors[key];
        });
        setFormErrors(backendErrors);
      } else {
        toast.error(result.error || 'Failed to update profile.');
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton variant="stats" count={4} />
          </div>
          <div className="h-64 rounded-3xl bg-white border border-gray-150 animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  const placeholderAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

  const stats = [
    {
      label: 'Total Blogs',
      value: user.stats.total_blogs,
      icon: ClipboardList,
      color: 'text-indigo-650',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100/80',
    },
    {
      label: 'Published Blogs',
      value: user.stats.published_blogs,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100/80',
    },
    {
      label: 'Draft Blogs',
      value: user.stats.draft_blogs,
      icon: Clock,
      color: 'text-amber-605',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100/80',
    },
    {
      label: 'Likes Received',
      value: user.stats.likes_received,
      icon: Heart,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100/80',
    },
    {
      label: 'Comments Received',
      value: user.stats.comments_received,
      icon: MessageSquare,
      color: 'text-sky-655',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-100/80',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Header */}
          <div className="border-b border-gray-150 pb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-955">Personal Dashboard</h2>
              <p className="mt-1.5 text-sm font-semibold text-gray-400">Monitor engagement metrics, track recent activities, and configure your profile.</p>
            </div>
          </div>

          {/* Stats Widgets */}
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-5 rounded-2xl border ${stat.borderColor} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.bgColor} ${stat.color}`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <p className="text-xxs font-black uppercase tracking-wider text-gray-400">{stat.label}</p>
                    <h3 className="mt-1 text-2xl font-black text-gray-950 leading-none">{stat.value}</h3>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Layout Columns */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            
            {/* Left Column: Form Settings */}
            <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-gray-955 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-650" />
                <span>Profile Settings</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Profile Image selector */}
                <div className="flex flex-col items-center gap-3 pb-3 border-b border-gray-50">
                  <img
                    src={imagePreview || placeholderAvatar}
                    alt={name}
                    className="h-20 w-20 rounded-full object-cover border border-gray-250 shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderAvatar;
                    }}
                  />
                  
                  <label className="cursor-pointer rounded-xl border border-gray-250 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                    <span>Change Avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUpdating}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="prof-name" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span>Full Name</span>
                  </label>
                  <input
                    id="prof-name"
                    type="text"
                    required
                    value={name}
                    disabled={isUpdating}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                      formErrors.name ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-red-500 font-semibold">{formErrors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="prof-phone" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-450 mb-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    value={phone}
                    disabled={isUpdating}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                      formErrors.phone ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-250 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {formErrors.phone && <p className="mt-1 text-xs text-red-500 font-semibold">{formErrors.phone}</p>}
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="prof-bio" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-455 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    <span>Bio Description</span>
                  </label>
                  <textarea
                    id="prof-bio"
                    value={bio}
                    disabled={isUpdating}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself, interests, tech stacks..."
                    rows="4"
                    className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-gray-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-colors btn-active-press disabled:bg-indigo-400"
                >
                  {isUpdating ? 'Saving Changes...' : 'Update Settings'}
                </button>

              </form>

            </div>

            {/* Right Column: Activity & Latest Blogs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Latest Blogs */}
              <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
                  <h3 className="text-lg font-black text-gray-955">My Latest Articles</h3>
                  <Link
                    to="/my-blogs"
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-705"
                  >
                    <span>Manage all</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {user.latest_blogs.length === 0 ? (
                  <p className="text-sm font-semibold text-gray-400 py-4 text-center">You haven't written any posts yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {user.latest_blogs.map((b) => (
                      <div key={b.id} className="flex justify-between items-center py-3">
                        <div className="min-w-0">
                          <Link to={`/blogs/${b.id}`} className="hover:text-indigo-600 transition-colors block">
                            <h4 className="text-sm font-black text-gray-950 truncate leading-snug">{b.title}</h4>
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-xxs font-bold">
                            <span className="text-gray-400">{new Date(b.created_at).toLocaleDateString()}</span>
                            <span>&bull;</span>
                            <span className={b.published ? 'text-emerald-700' : 'text-amber-705'}>
                              {b.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/edit-blog/${b.id}`}
                          className="shrink-0 rounded-lg border border-gray-250 bg-white px-2.5 py-1 text-xxs font-black text-gray-700 hover:bg-gray-50 transition-colors ml-4"
                        >
                          Edit
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity feed list */}
              <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-gray-955 border-b border-gray-100 pb-3 mb-2">
                  Recent Activity Logs
                </h3>

                {user.recent_activity.length === 0 ? (
                  <p className="text-sm font-semibold text-gray-400 py-4 text-center">No recent activities on file.</p>
                ) : (
                  <div className="relative border-l border-gray-150 pl-4 ml-2 space-y-5">
                    {user.recent_activity.map((act) => (
                      <div key={act.id} className="relative text-sm font-medium">
                        {/* Dot marker */}
                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 border border-white shadow-sm" />
                        <div className="text-gray-700">{act.description}</div>
                        <div className="text-xxs text-gray-400 font-semibold mt-0.5">
                          {new Date(act.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
