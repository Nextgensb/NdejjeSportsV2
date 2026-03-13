import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state as State;
    if (hasError) {
      let displayMessage = "Something went wrong. Please try refreshing the page.";
      
      try {
        const parsed = JSON.parse(error?.message || '');
        if (parsed.error) {
          displayMessage = `Security Restriction: Access to ${parsed.path} was denied (${parsed.operationType}).`;
        }
      } catch (e) {
        if (error?.message) {
          displayMessage = error.message;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg p-4">
          <div className="glass-card max-w-md w-full p-8 text-center border-t-4 border-red-500">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-app-text mb-4 uppercase tracking-tight">System Error</h2>
            <p className="text-app-text/60 mb-8 font-medium">
              {displayMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2 group"
            >
              <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-bold uppercase tracking-widest">Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}

export default ErrorBoundary;
