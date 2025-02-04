import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, CreditCard, AlertTriangle } from 'lucide-react';
import { useStore } from './store/useStore';
import { ExportButton } from './components/ExportButton';

export const ListaGastos: React.FC = () => {
  const { 
    gastos = [], 
    categoriasIngreso = [],
    eliminarGasto, 
    eliminarTodosLosGastos,
    registrarPago,
    loading, 
    error 
  } = useStore();

  const [gastoSeleccionado, setGastoSeleccionado] = useState<any>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const handleEliminarGasto = async (id: string) => {
    try {
      await eliminarGasto(id);
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
    }
  };

  const handleEliminarTodo = async () => {
    try {
      await eliminarTodosLosGastos();
      setMostrarConfirmacion(false);
    } catch (error) {
      console.error('Error al eliminar todos los gastos:', error);
    }
  };

  const handleRegistrarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoSeleccionado) return;

    try {
      await registrarPago(
        gastoSeleccionado.id,
        gastoSeleccionado.montoPendiente,
        gastoSeleccionado.cuentaPago
      );
      setGastoSeleccionado(null);
    } catch (error) {
      console.error('Error al registrar pago:', error);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '-';
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Lista de Gastos</h2>
        <div className="flex items-center space-x-4">
          {exportSuccess && (
            <span className="text-green-600 dark:text-green-400 text-sm">
              ¡Exportación completada!
            </span>
          )}
          <ExportButton 
            gastos={gastos} 
            onExportSuccess={() => {
              setExportSuccess(true);
              setTimeout(() => setExportSuccess(false), 3000);
            }}
          />
          {gastos.length > 0 && (
            <button
              onClick={() => setMostrarConfirmacion(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Borrar Todo
            </button>
          )}
        </div>
      </div>

      {gastos.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          No hay gastos registrados
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {gastos.map((gasto) => (
                <tr key={gasto.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(gasto.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {gasto.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      gasto.esFijo
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {gasto.esFijo ? 'Fijo' : 'Variable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${gasto.monto.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      gasto.estadoPago === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : gasto.estadoPago === 'parcial'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {gasto.estadoPago.charAt(0).toUpperCase() + gasto.estadoPago.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {gasto.estadoPago !== 'pagado' && (
                        <button
                          onClick={() => setGastoSeleccionado({
                            ...gasto,
                            montoPendiente: gasto.monto - (gasto.montoPagado || 0),
                            cuentaPago: ''
                          })}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Registrar pago"
                        >
                          <CreditCard className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminarGasto(gasto.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación para borrar todo */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmar eliminación
              </h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              ¿Estás seguro de que deseas eliminar todos los gastos? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarTodo}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Eliminar Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de registro de pago */}
      {gastoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Registrar Pago
            </h3>
            <form onSubmit={handleRegistrarPago} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monto a Pagar
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={gastoSeleccionado.montoPendiente}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cuenta
                </label>
                <select
                  value={gastoSeleccionado.cuentaPago}
                  onChange={(e) => setGastoSeleccionado({
                    ...gastoSeleccionado,
                    cuentaPago: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar cuenta</option>
                  {categoriasIngreso.map((cuenta) => (
                    <option
                      key={cuenta.id}
                      value={cuenta.id}
                      disabled={cuenta.saldo < gastoSeleccionado.montoPendiente}
                    >
                      {cuenta.nombre} (${cuenta.saldo.toFixed(2)})
                      {cuenta.saldo < gastoSeleccionado.montoPendiente ? ' - Saldo insuficiente' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setGastoSeleccionado(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  disabled={!gastoSeleccionado.cuentaPago}
                >
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};