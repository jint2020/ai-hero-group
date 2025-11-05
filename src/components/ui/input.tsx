import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className='block text-sm font-mono text-gray-300 mb-2'>
          {label}
        </label>
      )}
      <input
        className='pixel-input w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-400 focus:outline-none'
        {...props}
      />
      {error && (
        <div className='mt-1 text-xs text-red-400'>{error}</div>
      )}
    </div>
  );
};

export default Input;
