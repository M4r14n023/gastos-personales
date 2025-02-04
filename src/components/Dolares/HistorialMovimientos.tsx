import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MovimientoDolar } from '../../types';

interface Props {
  movimientos: MovimientoDolar[];
  loading?: boolean;
}

export const HistorialMovimientos: React.FC<Props> = ({ movimientos, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
        No hay movimientos registrados
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Monto USD
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Cotización
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Monto ARS
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Descripción
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {movimientos.map((mov) => (
            <tr key={mov.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {format(mov.fecha, 'dd/MM/yyyy HH:mm', { locale: es })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  mov.tipo === 'compra'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : mov.tipo === 'venta'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                USD {mov.montoDolares.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {mov.cotizacion ? `$${mov.cotizacion.toFixed(2)}` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {mov.montoPesos ? `$${mov.montoPesos.toFixed(2)}` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {mov.descripcion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};