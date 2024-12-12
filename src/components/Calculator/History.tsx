import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { HistoryItem } from './types';

interface HistoryProps {
  history: HistoryItem[];
}

export const History: React.FC<HistoryProps> = ({ history }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Historial</h3>
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay operaciones registradas
          </p>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {format(item.timestamp, 'HH:mm:ss', { locale: es })}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {item.operation}
                </span>
              </div>
              <div className="text-right font-mono text-lg text-gray-800 dark:text-white">
                {item.result}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};