import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card max-w-md w-full p-8 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              <p className="text-surface-600 dark:text-surface-400 text-sm">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            <div className="p-4 bg-surface-100 dark:bg-surface-900 rounded-lg text-left overflow-hidden">
              <p className="text-xs text-red-500 dark:text-red-400 font-mono break-words">
                {this.state.error?.toString()}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full gradient-btn py-3 flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Page
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
