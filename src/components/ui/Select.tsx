import React from 'react';
import { cn } from '../../utils/cn';
import type { SelectOption } from '../../types/global';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
  onChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helpText,
  options,
  placeholder,
  wrapperClassName,
  className,
  onChange,
  id,
  value,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <select
        {...props}
        id={selectId}
        value={value}
        onChange={handleChange}
        className={cn(
          // Base styles
          'block w-full rounded-md border-gray-300 shadow-sm',
          'focus:border-primary-500 focus:ring-primary-500',
          'disabled:bg-gray-50 disabled:text-gray-500',
          'bg-white text-gray-900',
          
          // Error styles
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default Select;