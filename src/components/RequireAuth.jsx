import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ me, loading, children }) {
  const location = useLocation();

  if (loading) {
    return <div className="subtle-text">Checking session...</div>;
  }

  if (!me) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
