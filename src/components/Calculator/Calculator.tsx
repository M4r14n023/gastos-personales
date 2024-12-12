import React from 'react';
import { useCalculator } from './hooks/useCalculator';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { History } from './History';
import { Calculator as CalculatorIcon } from 'lucide-react';

export const Calculator: React.FC = () => {
  const {
    display,
    history,
    handleNumber,
    handleOperator,
    handleEquals,
    handleClear,
    handleDelete,
    error
  } = useCalculator();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <CalculatorIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Calculadora</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Display value={display} error={error} />
          <Keypad
            onNumber={handleNumber}
            onOperator={handleOperator}
            onEquals={handleEquals}
            onClear={handleClear}
            onDelete={handleDelete}
          />
        </div>
        <History history={history} />
      </div>
    </div>
  );
};