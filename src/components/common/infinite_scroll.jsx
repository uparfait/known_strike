
import React, { useEffect, useRef, useCallback } from 'react'
import LoadingSkeleton from './loading_skeleton'

const InfiniteScroll = ({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading,
  className = '',
  threshold = 200
}) => {
  const observerRef = useRef()
  const loadingRef = useRef()

  const lastItemRef = useCallback(
    (node) => {
      if (loading) return
      if (observerRef.current) observerRef.current.disconnect()
      
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      }, {
        threshold: 0.1,
        rootMargin: `${threshold}px`
      })
      
      if (node) observerRef.current.observe(node)
    },
    [loading, hasMore, loadMore, threshold]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={item._id || index}
          ref={index === items.length - 1 ? lastItemRef : null}
        >
          {renderItem(item, index)}
        </div>
      ))}
      
      {loading && (
        <div ref={loadingRef} className="mt-6">
          <LoadingSkeleton type="card" count={4} />
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="text-center py-8 text-text-secondary">
          No more items to load
        </div>
      )}
    </div>
  )
}

export default InfiniteScroll
