import { useState, useCallback } from 'react';
import { evaluate } from '../utils/calculator';
import { HistoryItem } from '../types';

export const useCalculator = () => {
  const [display, setDisplay] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string>();
  const [lastWasOperator, setLastWasOperator] = useState(false);

  const handleNumber = useCallback((num: string) => {
    setError(undefined);
    if (num === '.' && display.includes('.')) return;
    if (num === '.' && (display === '' || lastWasOperator)) {
      setDisplay(prev => prev + '0.');
    } else {
      setDisplay(prev => prev + num);
    }
    setLastWasOperator(false);
  }, [display, lastWasOperator]);

  const handleOperator = useCallback((op: string) => {
    setError(undefined);
    if (display === '' && op === '-') {
      setDisplay('-');
      return;
    }
    if (display === '' || display === '-') return;
    
    if (lastWasOperator) {
      setDisplay(prev => prev.slice(0, -1) + op);
    } else {
      setDisplay(prev => prev + op);
    }
    setLastWasOperator(true);
  }, [display, lastWasOperator]);

  const handleEquals = useCallback(() => {
    if (!display || lastWasOperator) return;

    try {
      const result = evaluate(display);
      const newHistoryItem: HistoryItem = {
        operation: display,
        result: result.toString(),
        timestamp: new Date()
      };

      setHistory(prev => [newHistoryItem, ...prev]);
      setDisplay(result.toString());
      setLastWasOperator(false);
      setError(undefined);
    } catch (err: any) {
      setError(err.message);
    }
  }, [display, lastWasOperator]);

  const handleClear = useCallback(() => {
    setDisplay('');
    setError(undefined);
    setLastWasOperator(false);
  }, []);

  const handleDelete = useCallback(() => {
    setDisplay(prev => prev.slice(0, -1));
    setError(undefined);
    setLastWasOperator(false);
  }, []);

  return {
    display,
    history,
    error,
    handleNumber,
    handleOperator,
    handleEquals,
    handleClear,
    handleDelete
  };
};