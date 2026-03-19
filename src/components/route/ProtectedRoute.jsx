import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import supabase from "../utils/Supabase";

const ProtectedRoute = () => {
  const [session, setSession] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      const session = data.session;

      if (session) {
        const loginTime = localStorage.getItem("loginTime");

        if (loginTime) {
          const now = Date.now();
          const diff = now - parseInt(loginTime, 10);

          const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

          if (diff > TWENTY_FOUR_HOURS) {
            await supabase.auth.signOut();
            localStorage.removeItem("loginTime");
            setSession(null);
            return;
          }
        }
      }

      setSession(session);
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
