import React from 'react'

const ExactMatchHighlight = ({ text, match }) => {
  if (!match) return <>{text}</>
  const regex = new RegExp(`(${match})`, 'i')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-300 text-gray-900 rounded px-1 font-bold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export default ExactMatchHighlight
