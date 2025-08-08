import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './header'
import Sidebar from './sidebar'
import Movies from '../../pages/movies'

const Layout = () => {
  const [selectedGenre, setSelectedGenre] = useState('')
  const location = useLocation()

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre)
  }

  const renderContent = () => {
    if (location.pathname === '/movies' || location.pathname === '/dashboard') {
      return <Movies selectedGenre={selectedGenre} />
    }
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen bg-dark-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-0 pb-16 lg:pb-0">
        <Header 
          onGenreSelect={handleGenreSelect}
          selectedGenre={selectedGenre}
        />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default Layout