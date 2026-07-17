import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ search, setSearch, placeholder = "Search articles..." }) => {
  return (
    <div className="relative shadow-sm rounded-xl w-full">
      <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
      <input
        type="text"
        aria-label="Search posts"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-250 py-2.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
      />
    </div>
  );
};

export default SearchBar;
