import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl sm:text-9xl font-black gradient-text mb-6"
        >
          404
        </motion.div>
        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 font-medium text-sm transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link
            to="/"
            className="gradient-btn px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
