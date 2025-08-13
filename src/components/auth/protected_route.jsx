import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth_context";
import { Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { is_authenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-primary">
        Checking authentication...
      </div>
    );
  }
  return is_authenticated ? (
    <>
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
