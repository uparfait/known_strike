import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

const InfiniteScroll = ({ 
  items = [], 
  render_item, 
  load_more, 
  loading = false,
  className = '',
  threshold = 200
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef()
  const loadingRef = useRef()

  const loadMoreItems = useCallback(async () => {
    if (isLoadingMore || loading || !hasMore) return

    setIsLoadingMore(true)
    try {
      const hasMoreItems = await load_more()
      setHasMore(hasMoreItems)
    } catch (error) {
      console.error('Error loading more items:', error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, loading, hasMore, load_more])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && !loading && !isLoadingMore && hasMore) {
          loadMoreItems()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: `${threshold}px`
      }
    )

    observerRef.current = observer
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMoreItems, threshold, loading, isLoadingMore, hasMore])

  useEffect(() => {
    if (loadingRef.current && observerRef.current) {
      observerRef.current.observe(loadingRef.current)
    }

    return () => {
      if (loadingRef.current && observerRef.current) {
        observerRef.current.unobserve(loadingRef.current)
      }
    }
  }, [items.length])

  return (
    <div className="w-full">
      <div className={className}>
        {items.map((item, index) => render_item(item, index))}
      </div>
      
      {(isLoadingMore || (loading && items.length === 0)) && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500 mr-2" />
          <span className="text-text-secondary">Loading...</span>
        </div>
      )}
      
      {hasMore && !loading && !isLoadingMore && items.length > 0 && (
        <div 
          ref={loadingRef}
          className="flex justify-center items-center py-4 opacity-0"
        >
          <span className="text-text-secondary text-sm">Loading more...</span>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <span className="text-text-secondary text-sm">No more items to load</span>
        </div>
      )}
    </div>
  )
}

export default InfiniteScroll