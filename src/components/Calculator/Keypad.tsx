import React from 'react';
import { Delete, X, Divide, Plus, Minus } from 'lucide-react';

interface KeypadProps {
  onNumber: (num: string) => void;
  onOperator: (op: string) => void;
  onEquals: () => void;
  onClear: () => void;
  onDelete: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  onNumber,
  onOperator,
  onEquals,
  onClear,
  onDelete
}) => {
  const Button: React.FC<{
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
  }> = ({ onClick, className = '', children }) => (
    <button
      onClick={onClick}
      className={`p-4 text-lg font-semibold rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Primera fila */}
      <Button
        onClick={onClear}
        className="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
      >
        C
      </Button>
      <Button
        onClick={onDelete}
        className="bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
      >
        <Delete className="h-5 w-5 mx-auto" />
      </Button>
      <Button
        onClick={() => onOperator('/')}
        className="bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300"
      >
        <Divide className="h-5 w-5 mx-auto" />
      </Button>
      <Button
        onClick={() => onOperator('*')}
        className="bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300"
      >
        <X className="h-5 w-5 mx-auto" />
      </Button>

      {/* Números y operadores */}
      {[7, 8, 9].map(num => (
        <Button
          key={num}
          onClick={() => onNumber(num.toString())}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={() => onOperator('-')}
        className="bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300"
      >
        <Minus className="h-5 w-5 mx-auto" />
      </Button>

      {[4, 5, 6].map(num => (
        <Button
          key={num}
          onClick={() => onNumber(num.toString())}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={() => onOperator('+')}
        className="bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300"
      >
        <Plus className="h-5 w-5 mx-auto" />
      </Button>

      {[1, 2, 3].map(num => (
        <Button
          key={num}
          onClick={() => onNumber(num.toString())}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={onEquals}
        className="bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300 row-span-2"
      >
        =
      </Button>

      <Button
        onClick={() => onNumber('0')}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white col-span-2"
      >
        0
      </Button>
      <Button
        onClick={() => onNumber('.')}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
      >
        .
      </Button>
    </div>
  );
};