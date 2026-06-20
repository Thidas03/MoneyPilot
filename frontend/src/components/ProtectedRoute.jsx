import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="relative flex flex-col items-center">
          {/* Animated Spinner with outer pulse glow */}
          <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <div className="absolute w-16 h-16 border border-brand-500/10 rounded-full animate-pulse"></div>
          <p className="mt-4 text-dark-300 font-medium tracking-wide animate-pulse">Loading MoneyPilot...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
