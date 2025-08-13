import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/app_context';
import LoadingSkeleton from '../components/common/loading_skeleton';
import toast from 'react-hot-toast';

const Logs = () => {
  const { api_request } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await api_request('GET', '/logs');
      if (response.data.success) {
        setLogs(response.data.logs || []);
      }
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">System Logs</h1>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div>No logs found.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={log._id || idx} className="bg-secondary p-4 rounded border border-tertiary">
                <div className="font-mono text-xs text-text-secondary">{log.type}</div>
                <div>{log.log_data}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Logs;
