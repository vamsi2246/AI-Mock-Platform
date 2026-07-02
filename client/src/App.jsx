import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { lazy, Suspense } from "react";

// Lazy loaded pages
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const InterviewSetup = lazy(() => import("./pages/InterviewSetup"));
const InterviewRoom = lazy(() => import("./pages/InterviewRoom"));
const Report = lazy(() => import("./pages/Report"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-surface-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/interview/setup"
                      element={<InterviewSetup />}
                    />
                    <Route path="/interview/:id/report" element={<Report />} />
                  </Route>
                  <Route path="/interview/:id" element={<InterviewRoom />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster
              position="top-right"
              toastOptions={{
                className: "glass-card !p-4",
                duration: 4000,
                style: {
                  background: "var(--toast-bg, #fff)",
                  color: "var(--toast-color, #1e293b)",
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
