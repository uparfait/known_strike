
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth_context'
import { AppProvider } from './contexts/app_context'
import Layout from './components/layout/layout'
import LoginPage from './pages/login_page'
import DashboardPage from './pages/dashboard_page'
import MoviesPage from './pages/movies_page'
import AddMoviePage from './pages/add_movie_page'
import GenresPage from './pages/genres_page'
import UsersPage from './pages/users_page'
import StatisticsPage from './pages/statistics_page'
import WatchPage from './pages/watch_page'
import CategoryPage from './pages/category_page'
import SearchPage from './pages/search_page'
import ProtectedRoute from './components/auth/protected_route'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-dark-100 text-white">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="movies" element={<MoviesPage />} />
              <Route path="add-movie" element={<AddMoviePage />} />
              <Route path="edit-movie/:id" element={<AddMoviePage />} />
              <Route path="genres" element={<GenresPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="watch" element={<WatchPage />} />
              <Route path="category" element={<CategoryPage />} />
              <Route path="search" element={<SearchPage />} />
            </Route>
          </Routes>
        </div>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/auth_context'
import { AppProvider } from './contexts/app_context'
import Layout from './components/layout/layout'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Movies from './pages/movies'
import AddMovie from './pages/add_movie'
import Genres from './pages/genres'
import Users from './pages/users'
import Statistics from './pages/statistics'
import Watch from './pages/watch'
import Category from './pages/category'
import Search from './pages/search'
import ProtectedRoute from './components/common/protected_route'

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-primary">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#0d2b45',
                  color: '#d6deeb',
                  border: '1px solid #1d3b53',
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/watch" element={<Watch />} />
              <Route path="/category" element={<Category />} />
              <Route path="/search" element={<Search />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="movies" element={<Movies />} />
                <Route path="add-movie" element={<AddMovie />} />
                <Route path="genres" element={<Genres />} />
                <Route path="users" element={<Users />} />
                <Route path="statistics" element={<Statistics />} />
              </Route>
            </Routes>
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
