import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/app_context';
import LoadingSkeleton from '../components/common/loading_skeleton';
import toast from 'react-hot-toast';

const Comments = ({ movieId }) => {
  const { api_request } = useApp();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movieId) loadComments();
  }, [movieId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await api_request('GET', `/comments/${movieId}`);
      if (response.data.success) {
        setComments(response.data.comments || []);
      }
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Comments</h2>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-2">
          {comments.length === 0 ? (
            <div>No comments found.</div>
          ) : (
            comments.map((comment, idx) => (
              <div key={comment._id || idx} className="bg-secondary p-3 rounded border border-tertiary">
                <div className="font-semibold">{comment.user_id?.username || 'User'}</div>
                <div>{comment.comment}</div>
                <div className="text-xs text-text-secondary">{new Date(comment.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Comments;
