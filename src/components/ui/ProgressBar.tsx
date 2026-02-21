import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  labelPosition = 'outside',
  className,
  animated = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    default: 'bg-zinc-700',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-amber-500 to-amber-600',
  };

  const trackVariants = {
    default: 'bg-zinc-800',
    success: 'bg-emerald-500/20',
    warning: 'bg-amber-500/20',
    danger: 'bg-red-500/20',
    gradient: 'bg-zinc-800',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && labelPosition === 'outside' && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-zinc-400">Progress</span>
          <span className="text-sm font-medium text-zinc-200">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          sizes[size],
          trackVariants[variant]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variants[variant],
            animated && 'animate-progressPulse'
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && labelPosition === 'inside' && size === 'lg' && (
            <span className="flex items-center justify-center h-full text-xs font-medium text-zinc-950">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Circular Progress
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variants = {
    default: 'text-amber-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-500 ease-out', variants[variant])}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-zinc-200">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};
