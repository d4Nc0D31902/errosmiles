import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import supabase from "../utils/Supabase";

const ProtectedRoute = () => {
  const [session, setSession] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();
  }, []);

  // still checking session
  if (session === undefined) return null;

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  // not authenticated
  if (!session && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  // authenticated but trying to access login/register
  if (session && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
