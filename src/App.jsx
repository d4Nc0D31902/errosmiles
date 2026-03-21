import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./components/Home";
import PatientList from "./components/admin/PatientList";
import ViewPatient from "./components/admin/ViewPatient";
import Header from "./components/layouts/Header";
import Footer from "./components/layouts/Footer";
import Register from "./components/user/Register";
import Login from "./components/user/Login";
import ProtectedRoute from "./components/route/ProtectedRoute";

const App = () => {
  const location = useLocation();

  const hideLayoutRoutes = ["/login", "/register"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div>
      {/* {!hideLayout && <Header />} */}

      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patient/:id" element={<ViewPatient />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>

      {/* {!hideLayout && <Footer />} */}
    </div>
  );
};

export default App;
