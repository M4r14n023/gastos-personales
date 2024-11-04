import React from 'react';
import { useStore } from '../store/useStore';
import { CreditCard, DollarSign, PiggyBank } from 'lucide-react';

export const Resumen: React.FC = () => {
  const { gastos, creditos } = useStore();

  // Ensure gastos and creditos are arrays before reducing
  const totalGastos = (gastos || []).reduce((sum, gasto) => sum + gasto.monto, 0);
  const gastosFijos = (gastos || []).filter(g => g.esFijo);
  const totalGastosFijos = gastosFijos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const totalGastosVariables = totalGastos - totalGastosFijos;

  // Calculate total credit payments
  const totalCreditosPendientes = (creditos || []).reduce((sum, credito) => sum + (credito.montoRestante || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <DollarSign className="h-8 w-8 text-green-500" />
          <h3 className="ml-2 text-lg font-semibold text-gray-800">Total Gastos</h3>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">${totalGastos.toFixed(2)}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-blue-500" />
          <h3 className="ml-2 text-lg font-semibold text-gray-800">Gastos Fijos</h3>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">${totalGastosFijos.toFixed(2)}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <PiggyBank className="h-8 w-8 text-purple-500" />
          <h3 className="ml-2 text-lg font-semibold text-gray-800">Gastos Variables</h3>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">${totalGastosVariables.toFixed(2)}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-red-500" />
          <h3 className="ml-2 text-lg font-semibold text-gray-800">Créditos Pendientes</h3>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">${totalCreditosPendientes.toFixed(2)}</p>
      </div>
    </div>
  );
};