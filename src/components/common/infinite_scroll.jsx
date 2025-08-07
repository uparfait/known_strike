
import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

const InfiniteScroll = ({ 
  children, 
  has_more, 
  loading, 
  load_more, 
  threshold = 0.5 
}) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: false
  })

  useEffect(() => {
    if (inView && has_more && !loading) {
      load_more()
    }
  }, [inView, has_more, loading, load_more])

  return (
    <>
      {children}
      {has_more && (
        <div ref={ref} className="flex justify-center py-8">
          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          )}
        </div>
      )}
    </>
  )
}

export default InfiniteScroll
