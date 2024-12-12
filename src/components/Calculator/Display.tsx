import React from 'react';

interface DisplayProps {
  value: string;
  error?: string;
}

export const Display: React.FC<DisplayProps> = ({ value, error }) => {
  return (
    <div className="relative">
      <div className="w-full h-16 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-right overflow-hidden">
        <span className={`text-2xl font-mono ${error ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
          {error || value || '0'}
        </span>
      </div>
      {error && (
        <p className="absolute bottom-0 left-0 transform translate-y-full text-sm text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};