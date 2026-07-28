import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Diary from "./pages/Diary";
import DiaryDetail from "./pages/DiaryDetail";
import Communities from "./pages/Communities";
import Notifications from "./pages/Notifications";

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      {!location.pathname.startsWith("/dashboard") && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/success" element={<Success />} />
        <Route
          path="/diary"
          element={
            <ProtectedRoute>
              <Diary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:type/:id"
          element={
            <ProtectedRoute>
              <DiaryDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
        <Route path="/communities/:slug" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
