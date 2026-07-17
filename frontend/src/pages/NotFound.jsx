import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-55 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-md text-center py-20 px-4 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 mb-6 mx-auto shadow-inner">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-950">Page Not Found</h2>
          <p className="mt-3 text-sm text-gray-500 font-semibold leading-relaxed">
            The page you are trying to visit does not exist or has been relocated.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5.5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors btn-active-press"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back Home</span>
          </Link>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
