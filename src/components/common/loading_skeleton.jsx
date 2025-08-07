
import React from 'react'

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const render_card_skeleton = () => (
    <div className="card animate-pulse">
      <div className="bg-gray-700 h-48 w-full"></div>
      <div className="p-4">
        <div className="bg-gray-700 h-6 w-3/4 mb-2 rounded"></div>
        <div className="bg-gray-700 h-4 w-1/2 mb-3 rounded"></div>
        <div className="flex justify-between">
          <div className="bg-gray-700 h-6 w-16 rounded"></div>
          <div className="bg-gray-700 h-6 w-20 rounded"></div>
        </div>
      </div>
    </div>
  )

  const render_list_skeleton = () => (
    <div className="bg-dark-200 p-4 rounded-lg animate-pulse">
      <div className="bg-gray-700 h-6 w-1/4 mb-2 rounded"></div>
      <div className="bg-gray-700 h-4 w-1/2 rounded"></div>
    </div>
  )

  const render_stat_skeleton = () => (
    <div className="bg-dark-200 p-6 rounded-lg animate-pulse">
      <div className="bg-gray-700 h-8 w-16 mb-2 rounded"></div>
      <div className="bg-gray-700 h-6 w-24 rounded"></div>
    </div>
  )

  const get_skeleton_component = () => {
    switch (type) {
      case 'card':
        return render_card_skeleton()
      case 'list':
        return render_list_skeleton()
      case 'stat':
        return render_stat_skeleton()
      default:
        return render_card_skeleton()
    }
  }

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {get_skeleton_component()}
        </div>
      ))}
    </>
  )
}

export default LoadingSkeleton
