// PASTA: src/components/ui/Toast.tsx
// ✅ CORRIGIDO: Dependências de useCallback e useEffect adicionadas

'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './Button';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]); // ✅ Adicionada dependência removeToast

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 7000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message, duration: 6000 });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Componente ToastContainer para uso independente
interface ToastContainerProps {
  successMessage?: string;
  errorMessage?: string;
}

export function ToastContainer({ successMessage, errorMessage }: ToastContainerProps = {}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Adicionar toasts baseados nas props
  useEffect(() => {
    if (successMessage) {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = {
        id,
        type: 'success',
        title: successMessage,
        duration: 5000
      };
      setToasts(prev => [...prev, toast]);
      
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [successMessage, removeToast]); // ✅ Adicionada dependência removeToast

  useEffect(() => {
    if (errorMessage) {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = {
        id,
        type: 'error',
        title: errorMessage,
        duration: 7000
      };
      setToasts(prev => [...prev, toast]);
      
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, 7000);

      return () => clearTimeout(timeoutId);
    }
  }, [errorMessage, removeToast]); // ✅ Adicionada dependência removeToast

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove?: (id: string) => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-green-500 shadow-lg',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-900 dark:text-green-100'
    },
    error: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-red-500 shadow-lg',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-900 dark:text-red-100'
    },
    warning: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-yellow-500 shadow-lg',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-900 dark:text-yellow-100'
    },
    info: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-blue-500 shadow-lg',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-100'
    }
  };

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  return (
    <div className={clsx(
      'p-4 rounded-lg shadow-lg transition-all duration-300 animate-slide-left',
      style.container
    )}>
      <div className="flex items-start">
        <div className={clsx('flex-shrink-0 mr-3', style.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={clsx('text-sm font-medium', style.title)}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {toast.message}
            </p>
          )}
          {toast.action && (
            <Button
              onClick={toast.action.onClick}
              className={clsx(
                'mt-2 text-sm font-medium hover:underline',
                style.icon
              )}
            >
              {toast.action.label}
            </Button>
          )}
        </div>
        
        <Button
          onClick={() => onRemove?.(toast.id)}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

