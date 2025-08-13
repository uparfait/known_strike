import React from 'react';

const LoadingSkeleton = ({ type = 'card', lines = 4 }) => {
  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-6 bg-tertiary rounded w-full"></div>
        ))}
      </div>
    );
  }
  if (type === 'avatar') {
    return (
      <div className="flex items-center space-x-4 animate-pulse">
        <div className="w-12 h-12 bg-tertiary rounded-full"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-tertiary rounded w-3/4"></div>
          <div className="h-3 bg-tertiary rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  // Default: card
  return (
    <div className="card animate-pulse">
      <div className="w-full h-48 sm:h-56 md:h-64 bg-tertiary rounded-lg"></div>
      <div className="mt-3 sm:mt-4 space-y-2">
        <div className="h-4 sm:h-5 bg-tertiary rounded w-3/4"></div>
        <div className="h-3 sm:h-4 bg-tertiary rounded w-1/2"></div>
        <div className="h-3 sm:h-4 bg-tertiary rounded w-2/3"></div>
        <div className="flex justify-between mt-3">
          <div className="h-3 bg-tertiary rounded w-16"></div>
          <div className="h-3 bg-tertiary rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;