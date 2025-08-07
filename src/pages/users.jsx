
import React, { useState, useEffect } from 'react'
import { Users as UsersIcon, User, Calendar, Activity } from 'lucide-react'
import LoadingSkeleton from '../components/common/loading_skeleton'
import { useApp } from '../contexts/app_context'
import toast from 'react-hot-toast'

const Users = () => {
  const { api_request } = useApp()
  const [users, set_users] = useState([])
  const [loading, set_loading] = useState(true)

  useEffect(() => {
    load_users()
  }, [])

  const load_users = async () => {
    try {
      set_loading(true)
      const response = await api_request('GET', '/users')
      if (response.data.success) {
        set_users(response.data.users || [])
      }
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      set_loading(false)
    }
  }

  const format_date = (date_string) => {
    if (!date_string) return 'N/A'
    return new Date(date_string).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UsersIcon className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-semibold">Users</h1>
        {!loading && (
          <span className="text-text-secondary">
            ({users.length} total)
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(6).fill().map((_, index) => (
            <LoadingSkeleton key={index} className="h-20" />
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-secondary p-6 rounded-lg border border-tertiary hover:border-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      <p className="text-text-secondary">{user.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined: {format_date(user.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>Last active: {format_date(user.last_login)}</span>
                      </div>
                    </div>
                    
                    {user.role && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                        {user.role}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-text-secondary mb-1">User ID</div>
                  <div className="font-mono text-xs text-text-secondary bg-tertiary px-2 py-1 rounded">
                    {user._id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-text-secondary">No registered users in the system</p>
        </div>
      )}
    </div>
  )
}

export default Users
