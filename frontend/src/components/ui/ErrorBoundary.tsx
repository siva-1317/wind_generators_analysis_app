import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WindSense UI Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center space-y-4 border-rose-500/30">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Dashboard Render Issue</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/dashboard';
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload WindSense Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
