import React from 'react';
import { useStore } from '../store/useStore';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Balance } from '../types';

export const Balances: React.FC = () => {
  const { balances = [], loading, error } = useStore();

  const sortedBalances = [...(Array.isArray(balances) ? balances : [])].sort((a, b) => {
    const dateA = a.fecha instanceof Date ? a.fecha : new Date(a.fecha);
    const dateB = b.fecha instanceof Date ? b.fecha : new Date(b.fecha);
    return dateB.getTime() - dateA.getTime();
  });

  const getVariacion = (actual: number, anterior: number): number | null => {
    if (!anterior) return null;
    return ((actual - anterior) / anterior) * 100;
  };

  const formatDate = (date: Date | string | number): string => {
    const parsedDate = date instanceof Date ? date : new Date(date);
    return isValid(parsedDate) ? format(parsedDate, 'dd/MM/yyyy', { locale: es }) : 'Fecha inválida';
  };

  const downloadBalanceCSV = () => {
    if (!Array.isArray(balances) || balances.length === 0) return;

    const headers = ['Fecha', 'Gastos Fijos', 'Gastos Variables', 'Ingresos', 'Saldo Final'];
    const csvContent = [
      headers.join(','),
      ...sortedBalances.map(balance => [
        formatDate(balance.fecha),
        balance.gastosFijos.toFixed(2),
        balance.gastosVariables.toFixed(2),
        balance.ingresos.toFixed(2),
        balance.saldoFinal.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `balance_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Historial de Balances</h2>
          <button
            onClick={downloadBalanceCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            disabled={!Array.isArray(balances) || balances.length === 0}
          >
            <Download className="mr-2 h-5 w-5" />
            Descargar CSV
          </button>
        </div>

        {!Array.isArray(balances) || balances.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay balances registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gastos Fijos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gastos Variables</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Final</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBalances.map((balance, index) => {
                  const prevBalance = sortedBalances[index + 1];
                  const variacion = prevBalance ? getVariacion(balance.saldoFinal, prevBalance.saldoFinal) : null;
                  
                  return (
                    <tr key={balance.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(balance.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        ${balance.gastosFijos.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
                        ${balance.gastosVariables.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        ${balance.ingresos.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={balance.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${balance.saldoFinal.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {variacion !== null && (
                          <div className={`flex items-center ${variacion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variacion >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(variacion).toFixed(1)}%
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};