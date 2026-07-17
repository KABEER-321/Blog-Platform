import React from 'react';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-150 bg-white py-8 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-base font-black tracking-tight text-gray-950">
              Blog<span className="text-indigo-600">Sphere</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 font-semibold">
            &copy; {new Date().getFullYear()} BlogSphere. Built for software developers, designers, and tech innovators.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
