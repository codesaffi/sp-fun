import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, LayoutDashboard, BookOpen, Users, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <>
      <nav className="responsive-navbar backdrop-blur-md bg-[#0e0c12]/80 border-b border-white/10 sticky top-0 z-50">
        <Link to="/" className="brand-link" onClick={closeMenu}>
          <span className="brand-mark bg-[#d8fa61] text-[#0e0c12] font-bold rounded-lg px-2 py-0.5">m</span>
          <span className="font-semibold text-lg tracking-tight">MusicMatch</span>
        </Link>

        <div className="navbar-actions flex items-center gap-4">
          <div className="desktop-nav hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active font-medium text-[#d8fa61]" : "nav-link text-white/70 hover:text-white transition-colors"
              }
              end
            >
              <span className="inline-flex items-center gap-1.5"><Home className="w-4 h-4" /> Home</span>
            </NavLink>
            {token && (
              <>
                <NotificationCenter />
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive ? "nav-link active font-medium text-[#d8fa61]" : "nav-link text-white/70 hover:text-white transition-colors"
                  }
                >
                  <span className="inline-flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4" /> Dashboard</span>
                </NavLink>
                <NavLink
                  to="/diary"
                  className={({ isActive }) =>
                    isActive ? "nav-link active font-medium text-[#d8fa61]" : "nav-link text-white/70 hover:text-white transition-colors"
                  }
                >
                  <span className="inline-flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Music Diary</span>
                </NavLink>
                <NavLink
                  to="/communities"
                  className={({ isActive }) =>
                    isActive ? "nav-link active font-medium text-[#d8fa61]" : "nav-link text-white/70 hover:text-white transition-colors"
                  }
                >
                  <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> Communities</span>
                </NavLink>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLogout}
                  className="nav-link danger text-red-400 hover:text-red-300 transition-colors inline-flex items-center gap-1.5 ml-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </motion.button>
              </>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="menu-toggle md:hidden p-2 text-white/80 hover:text-white cursor-pointer"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mobile-nav-panel fixed top-[60px] left-0 right-0 bg-[#16131b] border-b border-white/10 p-4 z-50 flex flex-col gap-3 md:hidden shadow-2xl"
            >
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "mobile-nav-link active text-[#d8fa61]" : "mobile-nav-link text-white/80"
                }
                end
                onClick={closeMenu}
              >
                <span className="inline-flex items-center gap-2"><Home className="w-4 h-4" /> Home</span>
              </NavLink>
              {token && (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive ? "mobile-nav-link active text-[#d8fa61]" : "mobile-nav-link text-white/80"
                    }
                    onClick={closeMenu}
                  >
                    <span className="inline-flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/diary"
                    className={({ isActive }) =>
                      isActive ? "mobile-nav-link active text-[#d8fa61]" : "mobile-nav-link text-white/80"
                    }
                    onClick={closeMenu}
                  >
                    <span className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4" /> Music Diary</span>
                  </NavLink>
                  <NavLink
                    to="/communities"
                    className={({ isActive }) =>
                      isActive ? "mobile-nav-link active text-[#d8fa61]" : "mobile-nav-link text-white/80"
                    }
                    onClick={closeMenu}
                  >
                    <span className="inline-flex items-center gap-2"><Users className="w-4 h-4" /> Communities</span>
                  </NavLink>
                  <button onClick={handleLogout} className="mobile-nav-link danger text-red-400 text-left inline-flex items-center gap-2 cursor-pointer pt-2 border-t border-white/10">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
