import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer,
}) => {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800',
          'animate-modalIn max-h-[90vh] overflow-hidden flex flex-col',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-zinc-500 mt-1">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="ml-4 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// Confirmation Modal
interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmVariant?: 'primary' | 'danger';
  isConfirming?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  isConfirming = false,
  ...props
}) => {
  return (
    <Modal
      {...props}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={props.onClose}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isConfirming}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      {props.children}
    </Modal>
  );
};
