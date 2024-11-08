import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit2, Eye, PlusCircle } from 'lucide-react';
import { Credito } from '../../types';
import { SimuladorCredito } from './SimuladorCredito';
import { useStore } from '../../store/useStore';

export const ListaCreditos: React.FC = () => {
  const { creditos = [], agregarCredito, adelantarCuotasCredito, loading } = useStore();
  const [mostrarSimulador, setMostrarSimulador] = useState(false);
  const [creditoSeleccionado, setCreditoSeleccionado] = useState<Credito | null>(null);
  const [adelantoCuotas, setAdelantoCuotas] = useState({
    creditoId: '',
    monto: '',
    cuotasSeleccionadas: [] as number[]
  });

  // Calculate total amount when selected installments change
  useEffect(() => {
    if (adelantoCuotas.creditoId && adelantoCuotas.cuotasSeleccionadas.length > 0) {
      const credito = creditos.find(c => c.id === adelantoCuotas.creditoId);
      if (credito) {
        const totalMonto = credito.cuotas
          .filter(cuota => adelantoCuotas.cuotasSeleccionadas.includes(cuota.numero))
          .reduce((sum, cuota) => sum + cuota.cuota, 0);
        
        setAdelantoCuotas(prev => ({
          ...prev,
          monto: totalMonto.toFixed(2)
        }));
      }
    } else {
      setAdelantoCuotas(prev => ({
        ...prev,
        monto: ''
      }));
    }
  }, [adelantoCuotas.cuotasSeleccionadas, adelantoCuotas.creditoId, creditos]);

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

  const handleMostrarDetalle = (credito: Credito) => {
    setCreditoSeleccionado(credito);
  };

  const handleSaveCredito = async (credito: Omit<Credito, 'id'>) => {
    try {
      await agregarCredito(credito);
      setMostrarSimulador(false);
    } catch (error) {
      console.error('Error al guardar crédito:', error);
    }
  };

  const handleAdelantarCuotas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adelantoCuotas.creditoId && adelantoCuotas.monto && adelantoCuotas.cuotasSeleccionadas.length > 0) {
      try {
        await adelantarCuotasCredito(
          adelantoCuotas.creditoId,
          parseFloat(adelantoCuotas.monto),
          adelantoCuotas.cuotasSeleccionadas
        );
        setAdelantoCuotas({ creditoId: '', monto: '', cuotasSeleccionadas: [] });
      } catch (error) {
        console.error('Error al adelantar cuotas:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {mostrarSimulador ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Nuevo Crédito</h2>
            <button
              onClick={() => setMostrarSimulador(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Volver a la lista
            </button>
          </div>
          <SimuladorCredito onSave={handleSaveCredito} loading={loading} />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Créditos</h2>
            <button
              onClick={() => setMostrarSimulador(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Nuevo Crédito
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {creditos.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay créditos registrados
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Entidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Monto Inicial
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Monto Restante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Última Cuota
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
                    {creditos.map((credito) => (
                      <tr key={credito.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {credito.entidadBancaria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${credito.montoSolicitado.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${(credito.montoRestante || credito.montoSolicitado).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(credito.fechaUltimaCuota)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            credito.estado === 'activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {credito.estado === 'activo' ? 'Activo' : 'Simulación'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleMostrarDetalle(credito)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                            title="Ver detalle"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {credito.estado === 'activo' && (
                            <button
                              onClick={() => setAdelantoCuotas({
                                creditoId: credito.id,
                                monto: '',
                                cuotasSeleccionadas: []
                              })}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              title="Adelantar cuotas"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {creditoSeleccionado && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Detalle del Crédito - {creditoSeleccionado.entidadBancaria}
                  </h3>
                  <button
                    onClick={() => setCreditoSeleccionado(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cuota
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Amortización
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Interés
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {creditoSeleccionado.cuotas.map((cuota) => (
                        <tr key={cuota.numero}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cuota.numero}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(cuota.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${cuota.cuota.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${cuota.amortizacion.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${cuota.interes.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              cuota.pagada ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {cuota.pagada ? 'Pagada' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adelantoCuotas.creditoId && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Adelantar Cuotas</h3>
                  <button
                    onClick={() => setAdelantoCuotas({ creditoId: '', monto: '', cuotasSeleccionadas: [] })}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleAdelantarCuotas} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monto Total a Adelantar
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={adelantoCuotas.monto}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-50 cursor-not-allowed"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      El monto se calcula automáticamente según las cuotas seleccionadas
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Seleccionar Cuotas a Adelantar
                    </label>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {creditos
                        .find(c => c.id === adelantoCuotas.creditoId)
                        ?.cuotas
                        .filter(c => !c.pagada)
                        .map((cuota) => (
                          <label key={cuota.numero} className="flex items-center space-x-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded">
                            <input
                              type="checkbox"
                              checked={adelantoCuotas.cuotasSeleccionadas.includes(cuota.numero)}
                              onChange={(e) => {
                                const nuevasCuotas = e.target.checked
                                  ? [...adelantoCuotas.cuotasSeleccionadas, cuota.numero]
                                  : adelantoCuotas.cuotasSeleccionadas.filter(n => n !== cuota.numero);
                                setAdelantoCuotas({
                                  ...adelantoCuotas,
                                  cuotasSeleccionadas: nuevasCuotas
                                });
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Cuota {cuota.numero} - ${cuota.cuota.toFixed(2)}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                    disabled={loading || adelantoCuotas.cuotasSeleccionadas.length === 0}
                  >
                    {loading ? 'Procesando...' : 'Confirmar Adelanto'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};