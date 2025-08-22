'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Gerar ID único para o erro
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return { 
      hasError: true, 
      error,
      errorId 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary - Erro Capturado');
      console.error('Erro:', error);
      console.error('Informações do erro:', errorInfo);
      console.error('Stack trace completo:', error.stack);
      console.groupEnd();
    }

    // Armazenar informações do erro para exibição
    this.setState({
      error,
      errorInfo
    });

    // Chamar callback personalizado se fornecido
    this.props.onError?.(error, errorInfo);

    // Em produção, você pode enviar o erro para um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implementar integração com serviço de monitoramento (ex: Sentry, LogRocket)
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Exemplo de envio para API de logs
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // }).catch(console.error);

      console.warn('📊 Erro registrado para monitoramento:', errorData);
    } catch (logError) {
      console.error('❌ Falha ao registrar erro:', logError);
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback padrão
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Algo deu errado
                </h1>
                {this.state.errorId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ID do erro: {this.state.errorId}
                  </p>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada e está trabalhando para resolver o problema.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </Button>
              
              <Button
                onClick={this.handleReload}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Página
              </Button>
              
              <Button
                onClick={this.handleGoBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <LinkButton
                href="/dashboard"
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </LinkButton>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2 hover:text-gray-900 dark:hover:text-gray-100">
                  🔍 Detalhes do Erro (Desenvolvimento)
                </summary>
                <div className="space-y-3 mt-3">
                  <div>
                    <h3 className="font-medium text-red-600 dark:text-red-400 mb-1">
                      Mensagem do Erro:
                    </h3>
                    <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 overflow-auto text-red-800 dark:text-red-300">
                      {this.state.error.message}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <h3 className="font-medium text-red-600 dark:text-red-400 mb-1">
                        Stack Trace:
                      </h3>
                      <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 overflow-auto text-red-800 dark:text-red-300 max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo && (
                    <div>
                      <h3 className="font-medium text-red-600 dark:text-red-400 mb-1">
                        Component Stack:
                      </h3>
                      <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 overflow-auto text-red-800 dark:text-red-300 max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Se o problema persistir, entre em contato com o suporte técnico.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook para tratamento de erros em componentes funcionais
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('🚨 Erro capturado por useErrorHandler:', error, errorInfo);
    
    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Implementar envio para serviço de monitoramento
    }
  };
}

// HOC para envolver componentes com ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

