'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'medical' | 'danger' | 'success' | 'warning' | 'info'; // Add 'info' here
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);
  
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  }[size];
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    medical: 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 dark:border-teal-700',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' // Add this line
  }[variant];
  
  if (!isOpen) return null;
  
  // Ensure we're on the client side before using createPortal
  if (typeof window === 'undefined') return null;
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={handleOverlayClick}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full border rounded-2xl shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          'max-h-[90vh] overflow-hidden flex flex-col',
          sizeClasses,
          variantClasses,
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <Button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Confirmation Modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

// In the ConfirmationModal component, add variant mapping:
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  loading = false
}) => {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-red-500" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />,
    success: <CheckCircle className="w-6 h-6 text-green-500" />
  };
  
  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'primary' as const,
    success: 'success' as const
  };
  
  // Map ConfirmationModal variants to Modal variants
  const modalVariantMap = {
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'default' as const, // Map 'info' to 'default' or add 'info' to Modal
    success: 'success' as const
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      variant={modalVariantMap[variant]}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {icons[variant]}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
        
        <div className="flex gap-3 justify-center pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { Modal, ConfirmationModal };