import React, { useState } from 'react';
import { useApp } from '../contexts/app_context';
import toast from 'react-hot-toast';

const AdminActions = () => {
  const { clearLogs, api_request } = useApp();
  const [clearing, setClearing] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const response = await clearLogs();
      if (response.data && response.data.success) {
        toast.success('Logs cleared successfully');
      } else {
        toast.error(response.data?.error || 'Failed to clear logs');
      }
    } catch (error) {
      toast.error('Failed to clear logs');
    } finally {
      setClearing(false);
    }
  };

  const handleViewAllUsers = async () => {
    setLoadingUsers(true);
    setShowUsers(true);
    try {
      const response = await api_request('GET', '/users');
      if (response.data && response.data.success) {
        setUsers(response.data.users || []);
      } else {
        toast.error(response.data?.error || 'Failed to fetch users');
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Actions</h1>
      <div className="space-y-7">
        <button className="btn-primary mr-6" onClick={handleClearLogs} disabled={clearing}>
          {clearing ? 'Clearing Logs...' : 'Clear All Logs'}
        </button>
        <button className="btn-primary" onClick={handleViewAllUsers} disabled={loadingUsers}>
          {loadingUsers ? 'Loading Users...' : 'View All Users'}
        </button>
      </div>
      {showUsers && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">All Users</h2>
          {loadingUsers ? (
            <div>Loading...</div>
          ) : users.length === 0 ? (
            <div>No users found.</div>
          ) : (
            <ul className="space-y-2">
              {users.map(user => (
                <li key={user._id} className="bg-secondary p-3 rounded border border-tertiary">
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-xs text-text-secondary">ID: {user._id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminActions;
