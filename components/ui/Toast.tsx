'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!isVisible) return null;

  const Icon = type === 'success' ? CheckCircle : XCircle;
  
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
  };

  const iconClasses = {
    success: 'text-green-400 dark:text-green-300',
    error: 'text-red-400 dark:text-red-300',
  };

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
        typeClasses[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={clsx('h-5 w-5 flex-shrink-0', iconClasses[type])} />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="ml-2 flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  successMessage?: string;
  errorMessage?: string;
}

export function ToastContainer({ successMessage, errorMessage }: ToastContainerProps) {
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error'; message: string }>>([]);

  useEffect(() => {
    if (successMessage) {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, type: 'success', message: successMessage }]);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, type: 'error', message: errorMessage }]);
    }
  }, [errorMessage]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

