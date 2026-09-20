import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in UI:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-[#111726] border border-[#1F2C47] rounded-xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-5 text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">
              An unexpected UI error occurred while rendering this view. Your session and data remain safe.
            </p>
            {this.state.error && (
              <div className="bg-[#161F33] p-3 rounded-lg text-xs font-mono text-slate-400 mb-6 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium rounded-lg flex items-center gap-2 text-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <a
                href="/dashboard"
                className="px-4 py-2 bg-[#1F2C47] hover:bg-[#2A3B5E] text-white font-medium rounded-lg flex items-center gap-2 text-sm transition"
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
