import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { PageSkeleton } from "./components/Loading";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Success = lazy(() => import("./pages/Success"));
const Diary = lazy(() => import("./pages/Diary"));
const DiaryDetail = lazy(() => import("./pages/DiaryDetail"));
const Communities = lazy(() => import("./pages/Communities"));
const Notifications = lazy(() => import("./pages/Notifications"));

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      {!location.pathname.startsWith("/dashboard") && <Navbar />}

      <Suspense fallback={<PageSkeleton />}>
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
      </Suspense>
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
