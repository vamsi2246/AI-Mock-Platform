import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    try {
      await signup(email, password, firstName, lastName);
      toast.success("Account created! Welcome aboard.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 items-center justify-center p-12">
        <div className="text-white max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">Start practicing today</h2>
          <p className="text-white/70 leading-relaxed mb-8">
            Join thousands of candidates who improved their interview skills
            with AI-powered practice sessions.
          </p>
          <div className="glass-card !bg-white/10 !border-white/20 p-6 text-left">
            <p className="text-white/90 italic text-sm leading-relaxed">
              "The AI interviewer caught inconsistencies in my answers that I
              didn't even notice. The follow-up questions were surprisingly
              insightful."
            </p>
            <p className="text-white/60 text-sm mt-3">
              — Software Engineer, Google
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
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

          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-surface-500 dark:text-surface-400 mb-8">
            Start practicing interviews with AI
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="input-field pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="input-field"
                />
              </div>
            </div>

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
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
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
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-500 hover:text-brand-600 font-medium"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
