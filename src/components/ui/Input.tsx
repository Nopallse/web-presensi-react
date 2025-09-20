import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  wrapperClassName,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">{leftIcon}</span>
          </div>
        )}
        
        <input
          {...props}
          id={inputId}
          className={cn(
            // Base styles
            'block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-primary-500 focus:ring-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'placeholder-gray-400',
            
            // Icon spacing
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            
            // Error styles
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            
            className
          )}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default Input;