import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const SortDropdown = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-sm w-full sm:w-auto">
      <ArrowUpDown className="h-4.5 w-4.5 text-gray-400 shrink-0" />
      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Sort:</span>
      <select
        value={sortBy}
        aria-label="Sort blogs"
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-transparent outline-none cursor-pointer font-bold text-gray-800 flex-1 sm:flex-initial"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="most_commented">Most Commented</option>
        <option value="alphabetical">Alphabetical (A-Z)</option>
      </select>
    </div>
  );
};

export default SortDropdown;
