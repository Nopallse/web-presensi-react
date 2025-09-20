import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 disabled:bg-secondary-300',
  outline: 'border border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50 focus:ring-primary-500 disabled:bg-secondary-50 disabled:text-secondary-400',
  ghost: 'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500 disabled:text-secondary-400',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 disabled:bg-danger-300'
};

const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-base'
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        
        // Variant styles
        buttonVariants[variant],
        
        // Size styles
        buttonSizes[size],
        
        className
      )}
    >
      {isLoading ? (
        <>
          <svg
            className={cn('animate-spin -ml-1 mr-2 h-4 w-4')}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span className={cn('mr-2')}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={cn('ml-2')}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;