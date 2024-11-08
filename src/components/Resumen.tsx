import React from 'react';
import { useStore } from '../store/useStore';
import { CreditCard, DollarSign, PiggyBank } from 'lucide-react';

export const Resumen: React.FC = () => {
  const { gastos = [], creditos = [] } = useStore();

  // Calculate total expenses
  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const gastosFijos = gastos.filter(g => g.esFijo);
  const totalGastosFijos = gastosFijos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const totalGastosVariables = totalGastos - totalGastosFijos;

  // Calculate total credit balance
  const totalCreditosBalance = creditos.reduce((sum, credito) => {
    // Calculate total loan cost (principal + interest)
    const totalLoanCost = credito.cuotas.reduce((total, cuota) => total + cuota.cuota, 0);
    
    // Calculate paid amount
    const totalPagado = credito.cuotas
      .filter(cuota => cuota.pagada)
      .reduce((total, cuota) => total + cuota.cuota, 0);
    
    // Return negative remaining balance
    return sum - (totalLoanCost - totalPagado);
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <DollarSign className="h-8 w-8 text-green-500" />
          <h3 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">Total Gastos</h3>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${totalGastos.toFixed(2)}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-blue-500" />
          <h3 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">Gastos Fijos</h3>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${totalGastosFijos.toFixed(2)}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <PiggyBank className="h-8 w-8 text-purple-500" />
          <h3 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">Gastos Variables</h3>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${totalGastosVariables.toFixed(2)}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-red-500" />
          <h3 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">Balance Créditos</h3>
        </div>
        <p className={`mt-2 text-3xl font-bold ${totalCreditosBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          ${totalCreditosBalance.toFixed(2)}
        </p>
        {creditos.length > 0 && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {creditos.length} crédito{creditos.length !== 1 ? 's' : ''} activo{creditos.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};