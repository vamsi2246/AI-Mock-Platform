import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="font-bold text-2xl gradient-text inline-block mb-8"
          >
            InterviewAI
          </Link>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-surface-500 dark:text-surface-400 mb-8">
            Log in to continue your interview practice
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-btn py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Log In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-500 hover:text-brand-600 font-medium"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right: Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 items-center justify-center p-12">
        <div className="text-white max-w-md text-center">
          <div className="flex justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="wave-bar w-2 !bg-white/80"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Interview practice that actually works
          </h2>
          <p className="text-white/70 leading-relaxed">
            Our AI asks follow-up questions, challenges your answers, and adapts
            in real-time. No two interviews are the same.
          </p>
        </div>
      </div>
    </div>
  );
}
