
import React, { useEffect, useRef } from 'react'

const InfiniteScroll = ({ 
  hasMore = false, 
  loading = false, 
  onLoadMore, 
  threshold = 100,
  children 
}) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading || !onLoadMore) return

      const container = containerRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        onLoadMore()
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [hasMore, loading, onLoadMore, threshold])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      {children}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      )}
    </div>
  )
}

export default InfiniteScroll
