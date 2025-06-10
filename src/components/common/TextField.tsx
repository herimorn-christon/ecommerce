import React, { forwardRef } from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, fullWidth = false, startIcon, endIcon, className = '', ...props }, ref) => {
    const inputClasses = `
      block px-4 py-2 w-full rounded-md border 
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
               'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
      focus:outline-none focus:ring-1 
      ${startIcon ? 'pl-10' : ''}
      ${endIcon ? 'pr-10' : ''}
      ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    `;
    
    const widthClasses = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`${widthClasses} ${className}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {startIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
              {endIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;