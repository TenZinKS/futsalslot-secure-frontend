import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ me, children }) {
  const location = useLocation();

  if (!me) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
