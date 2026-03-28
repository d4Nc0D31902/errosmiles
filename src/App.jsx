import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Spin } from "antd"; // import Ant Design loader
import supabase from "./components/utils/Supabase";

import Home from "./components/Home";
import PatientList from "./components/admin/PatientList";
import ViewPatient from "./components/admin/ViewPatient";
import Register from "./components/user/Register";
import Login from "./components/user/Login";

// Wrapper for protected routes
const RequireAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [sessionExists, setSessionExists] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionExists(!!data.session);
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );

  return sessionExists ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const location = useLocation();
  const hideLayoutRoutes = ["/login", "/register"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div>
      {/* {!hideLayout && <Header />} */}

      {/* Admin routes protected by session */}
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route
          path="/patients"
          element={
            <RequireAuth>
              <PatientList />
            </RequireAuth>
          }
        />
        <Route
          path="/patient/:id"
          element={
            <RequireAuth>
              <ViewPatient />
            </RequireAuth>
          }
        />

        {/* Public user routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* {!hideLayout && <Footer />} */}
    </div>
  );
};

export default App;
