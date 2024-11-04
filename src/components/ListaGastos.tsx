import React from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

export const ListaGastos: React.FC = () => {
  const { gastos = [], categorias = [], mediosPago = [], eliminarGasto, loading, error } = useStore();

  const getCategoriaNombre = (id: string) => 
    categorias.find(cat => cat.id === id)?.nombre || 'Desconocida';

  const getMedioPagoNombre = (id: string) =>
    mediosPago.find(medio => medio.id === id)?.nombre || 'Desconocido';

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Lista de Gastos</h2>
      {gastos.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay gastos registrados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider table-cell-enhanced">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider table-cell-enhanced">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider table-cell-enhanced">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider table-cell-enhanced">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider table-cell-enhanced">Medio de Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider table-cell-enhanced">Cuotas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider table-cell-enhanced">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider table-cell-enhanced">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {gastos.map((gasto) => (
                <tr key={gasto.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 table-cell-enhanced">
                    {format(gasto.fecha instanceof Date ? gasto.fecha : new Date(gasto.fecha), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white table-cell-enhanced">
                    {gasto.descripcion}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${gasto.esFijo ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'} table-cell-enhanced`}>
                    ${gasto.monto.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 table-cell-enhanced">
                    {getCategoriaNombre(gasto.categoria)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 table-cell-enhanced">
                    {getMedioPagoNombre(gasto.medioPago)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 table-cell-enhanced">
                    {gasto.cuotas > 1 ? `${gasto.cuotaActual}/${gasto.cuotas}` : '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${gasto.esFijo ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'} table-cell-enhanced`}>
                    {gasto.esFijo ? 'Fijo' : 'Variable'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium table-cell-enhanced">
                    <button
                      onClick={() => eliminarGasto(gasto.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      disabled={loading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};