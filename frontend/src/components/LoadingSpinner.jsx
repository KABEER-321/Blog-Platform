import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-650" />
    </div>
  );
};

export default LoadingSpinner;
