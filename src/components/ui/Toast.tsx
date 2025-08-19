'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

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

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

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

function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-medical-success-500 shadow-success',
      icon: 'text-medical-success-600 dark:text-medical-success-400',
      title: 'text-medical-success-900 dark:text-medical-success-100'
    },
    error: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-medical-danger-500 shadow-danger',
      icon: 'text-medical-danger-600 dark:text-medical-danger-400',
      title: 'text-medical-danger-900 dark:text-medical-danger-100'
    },
    warning: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-medical-warning-500 shadow-warning',
      icon: 'text-medical-warning-600 dark:text-medical-warning-400',
      title: 'text-medical-warning-900 dark:text-medical-warning-100'
    },
    info: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-medical-info-500 shadow-medical',
      icon: 'text-medical-info-600 dark:text-medical-info-400',
      title: 'text-medical-info-900 dark:text-medical-info-100'
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
            <button
              onClick={toast.action.onClick}
              className={clsx(
                'mt-2 text-sm font-medium hover:underline',
                style.icon
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

