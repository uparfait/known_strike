
import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Film, 
  Plus, 
  Tag, 
  Users, 
  BarChart3 
} from 'lucide-react'

const Sidebar = () => {
  const nav_items = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/movies', icon: Film, label: 'Movies' },
    { path: '/add-movie', icon: Plus, label: 'Add Movie' },
    { path: '/genres', icon: Tag, label: 'Genres' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/statistics', icon: BarChart3, label: 'Statistics' },
  ]

  return (
    <div className="w-64 bg-dark-200 border-r border-gray-700 flex-shrink-0">
      <div className="p-6">
        <nav className="space-y-2">
          {nav_items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-dark-300 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
