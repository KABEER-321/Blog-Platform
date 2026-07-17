import React from 'react';
import { Tag } from 'lucide-react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-4 w-full">
      <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
        <Tag className="h-4 w-4" />
        <span>Categories</span>
      </h3>
      
      <div className="flex flex-col gap-1.5">
        {/* All Blogs category button */}
        <button
          onClick={() => onSelectCategory('All')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-gray-700 hover:bg-indigo-50/50 hover:text-indigo-650 btn-active-press ${
            selectedCategory === 'All' ? 'bg-indigo-50 text-indigo-755 border border-indigo-100 shadow-sm' : 'border border-transparent'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-gray-700 hover:bg-indigo-50/50 hover:text-indigo-650 flex items-center justify-between btn-active-press ${
              selectedCategory === cat.id ? 'bg-indigo-50 text-indigo-755 border border-indigo-100 shadow-sm' : 'border border-transparent'
            }`}
          >
            <span>{cat.name}</span>
            {cat.post_count !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-xxs font-black border ${
                selectedCategory === cat.id ? 'bg-white border-indigo-200 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                {cat.post_count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
