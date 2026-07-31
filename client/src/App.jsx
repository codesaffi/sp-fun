import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
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

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function AnimatedPage({ children }) {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      {!location.pathname.startsWith("/dashboard") && <Navbar />}

      <Suspense fallback={<PageSkeleton />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AnimatedPage><Dashboard /></AnimatedPage>
                </ProtectedRoute>
              }
            />

            <Route path="/success" element={<AnimatedPage><Success /></AnimatedPage>} />
            <Route
              path="/diary"
              element={
                <ProtectedRoute>
                  <AnimatedPage><Diary /></AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/:type/:id"
              element={
                <ProtectedRoute>
                  <AnimatedPage><DiaryDetail /></AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route path="/communities" element={<ProtectedRoute><AnimatedPage><Communities /></AnimatedPage></ProtectedRoute>} />
            <Route path="/communities/:slug" element={<ProtectedRoute><AnimatedPage><Communities /></AnimatedPage></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AnimatedPage><Notifications /></AnimatedPage></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            background: "#19151d",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#f7f4f7",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          },
        }}
      />
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
