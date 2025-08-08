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
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 bg-dark-200 border-r border-gray-700 flex-shrink-0">
        <div className="p-4 lg:p-6 w-full">
          <nav className="space-y-2">
            {nav_items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 lg:px-4 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                    isActive
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} className="lg:w-5 lg:h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation with glass effect*/}
      <div className="lg:hidden fixed bottom-0 left-0 right-0  border-t border-gray-700 z-50 bg-dark-800 backdrop-blur-lg shadow-lg">
        <nav className="flex justify-around items-center py-2">
          {nav_items.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-gray-500'
                    : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar