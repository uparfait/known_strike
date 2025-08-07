
import React from 'react'

const LoadingSkeleton = ({ className = '', width = '100%', height = '20px' }) => {
  return (
    <div
      className={`animate-pulse bg-tertiary rounded ${className}`}
      style={{ width, height }}
    />
  )
}

export default LoadingSkeleton
