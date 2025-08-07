import React from 'react'

const LoadingSkeleton = ({ type = 'card', count = 8 }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="card">
            <div className="skeleton h-64 w-full mb-4"></div>
            <div className="skeleton h-6 w-3/4 mb-2"></div>
            <div className="skeleton h-4 w-1/2 mb-2"></div>
            <div className="skeleton h-4 w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton h-16 w-full"></div>
        ))}
      </div>
    )
  }

  return <div className="skeleton h-32 w-full"></div>
}

export default LoadingSkeleton