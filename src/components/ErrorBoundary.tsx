'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Store error info for display
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Algo deu errado</h1>
            </div>
            
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada e está trabalhando para resolver o problema.
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Recarregar Página
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Voltar
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Detalhes do Erro (Desenvolvimento)
                </summary>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-red-600">Erro:</h3>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <h3 className="font-medium text-red-600">Stack Trace:</h3>
                      <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // You can add additional error handling logic here
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}