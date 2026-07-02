import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  User,
  Mic,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/interview/setup", icon: Mic, label: "New Interview" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-surface-200 dark:border-surface-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg gradient-text">InterviewAI</span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 glass border-r border-surface-200 dark:border-surface-800 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl gradient-text">
                  InterviewAI
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                          : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex-col p-6 z-40">
        <div className="mb-8">
          <span className="font-bold text-2xl gradient-text">InterviewAI</span>
          <p className="text-xs text-surface-400 mt-1">
            AI Mock Interview Platform
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm"
                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 pt-4 border-t border-surface-200 dark:border-surface-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName || "User"}
              </p>
              <p className="text-xs text-surface-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-[260px] pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
