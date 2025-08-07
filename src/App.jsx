
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
