import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'block w-full rounded-lg border bg-zinc-900/50 text-zinc-100 placeholder-zinc-500',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
              'transition-all duration-200',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                : 'border-zinc-700 hover:border-zinc-600',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              'px-4 py-2.5',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {rightIcon}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-red-400' : 'text-zinc-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// TextArea
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  rows?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = true,
      rows = 4,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'block w-full rounded-lg border bg-zinc-900/50 text-zinc-100 placeholder-zinc-500',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
            'transition-all duration-200 resize-none',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
              : 'border-zinc-700 hover:border-zinc-600',
            'px-4 py-3',
            className
          )}
          {...props}
        />
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-red-400' : 'text-zinc-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

// Select
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'block w-full rounded-lg border bg-zinc-900/50 text-zinc-100',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
            'transition-all duration-200 appearance-none',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
              : 'border-zinc-700 hover:border-zinc-600',
            'px-4 py-2.5 pr-10',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1rem',
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-red-400' : 'text-zinc-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
