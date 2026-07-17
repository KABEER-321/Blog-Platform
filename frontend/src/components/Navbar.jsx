import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, User, LogOut, Menu, X, Bookmark, LayoutDashboard, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const activeClassName = "border-b-2 border-indigo-600 text-gray-950 font-bold px-1.5 py-1 text-sm sm:text-base";
  const inactiveClassName = "text-gray-500 hover:text-indigo-650 px-1.5 py-1 text-sm sm:text-base font-semibold transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-150 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-150">
              <BookOpen className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-950">
              Blog<span className="text-indigo-600">Sphere</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
              Home
            </NavLink>
            <NavLink to="/blogs" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
              All Blogs
            </NavLink>
            {user && (
              <>
                <NavLink to="/my-blogs" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  My Blogs
                </NavLink>
                <NavLink to="/bookmarks" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Bookmarks
                </NavLink>
                {role === 'Admin' && (
                  <NavLink to="/admin" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                    Admin Panel
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* Auth Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <img
                    src={user.user.profile?.profile_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={user.user.username}
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                  <span>Hi, {user.user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-gray-250 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors btn-active-press flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-250 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors btn-active-press"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors btn-active-press"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 shadow-xl animate-fade-in">
          <nav className="flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-650 transition-all"
            >
              Home
            </Link>
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-650 transition-all"
            >
              All Blogs
            </Link>
            {user && (
              <>
                <Link
                  to="/my-blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-650 transition-all"
                >
                  <FileText className="h-4.5 w-4.5" />
                  <span>My Blogs</span>
                </Link>
                <Link
                  to="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-650 transition-all"
                >
                  <Bookmark className="h-4.5 w-4.5" />
                  <span>Bookmarks</span>
                </Link>
                {role === 'Admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-650 transition-all"
                  >
                    <LayoutDashboard className="h-4.5 w-4.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="border-t border-gray-100 my-2 pt-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4.5 w-4.5" />
                    <span>Profile settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-650 hover:bg-red-50 text-left transition-colors btn-active-press"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 mt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-gray-250 bg-white py-2.5 text-center text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-bold text-white shadow-md hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

    </header>
  );
};

export default Navbar;
