import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  info: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

interface ToastItemProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  };
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [onClose, toast.duration]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border',
        'shadow-lg shadow-black/20 animate-slideInRight',
        'min-w-[300px] max-w-md',
        toastStyles[toast.type]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
