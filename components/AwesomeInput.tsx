// components/AwesomeInput.tsx
'use client';

import React from 'react';

interface AwesomeInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  maxLength?: number;
}

const AwesomeInput: React.FC<AwesomeInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
  icon,
  className = '',
  maxLength,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 cursor-text">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {/* ✅ FIXED: Icon with proper spacing and no overlap */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        
        {/* ✅ FIXED: Input with proper padding to prevent overlap */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
            ${icon ? 'pl-12 pr-10' : 'px-4'} 
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : success 
                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-text'}
            hover:shadow-md
            placeholder-gray-500
            text-gray-900
            font-normal
            placeholder:pl-0 /* ✅ Ensure placeholder doesn't have padding */
          `}
          style={{
            // ✅ Force consistent padding - NO OVERLAP
            paddingLeft: icon ? '3.5rem' : '1rem',
            paddingRight: '2.5rem'
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          {error}
        </p>
      )}
      {success && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          {success}
        </p>
      )}
    </div>
  );
};

export default AwesomeInput;