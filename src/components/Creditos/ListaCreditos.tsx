import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit2, Eye, PlusCircle } from 'lucide-react';
import { Credito } from '../../types';
import { SimuladorCredito } from './SimuladorCredito';

interface Props {
  creditos: Credito[];
  onSave: (credito: Omit<Credito, 'id'>) => Promise<void>;
  onAdelantarCuotas: (creditoId: string, monto: number, cuotas: number[]) => Promise<void>;
  loading?: boolean;
}

export const ListaCreditos: React.FC<Props> = ({ creditos, onSave, onAdelantarCuotas, loading }) => {
  const [mostrarSimulador, setMostrarSimulador] = useState(false);
  const [creditoSeleccionado, setCreditoSeleccionado] = useState<Credito | null>(null);
  const [adelantoCuotas, setAdelantoCuotas] = useState({
    creditoId: '',
    monto: '',
    cuotasSeleccionadas: [] as number[]
  });

  const handleMostrarDetalle = (credito: Credito) => {
    setCreditoSeleccionado(credito);
  };

  const handleAdelantarCuotas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adelantoCuotas.creditoId && adelantoCuotas.monto && adelantoCuotas.cuotasSeleccionadas.length > 0) {
      await onAdelantarCuotas(
        adelantoCuotas.creditoId,
        parseFloat(adelantoCuotas.monto),
        adelantoCuotas.cuotasSeleccionadas
      );
      setAdelantoCuotas({ creditoId: '', monto: '', cuotasSeleccionadas: [] });
    }
  };

  return (
    <div className="space-y-6">
      {mostrarSimulador ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Nuevo Crédito</h2>
            <button
              onClick={() => setMostrarSimulador(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Volver a la lista
            </button>
          </div>
          <SimuladorCredito onSave={onSave} loading={loading} />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Créditos</h2>
            <button
              onClick={() => setMostrarSimulador(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Nuevo Crédito
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto Inicial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto Restante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Cuota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditos.map((credito) => (
                    <tr key={credito.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {credito.entidadBancaria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${credito.montoSolicitado.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${credito.montoRestante?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {credito.fechaUltimaCuota && format(credito.fechaUltimaCuota, 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          credito.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {credito.estado === 'activo' ? 'Activo' : 'Simulación'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleMostrarDetalle(credito)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
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
                            className="text-green-600 hover:text-green-900"
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
          </div>

          {creditoSeleccionado && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalle del Crédito - {creditoSeleccionado.entidadBancaria}
                  </h3>
                  <button
                    onClick={() => setCreditoSeleccionado(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ×
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cuota
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amortización
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interés
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {creditoSeleccionado.cuotas.map((cuota) => (
                        <tr key={cuota.numero}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cuota.numero}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(cuota.fecha, 'dd/MM/yyyy', { locale: es })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${cuota.cuota.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${cuota.amortizacion.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${cuota.interes.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              cuota.pagada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Adelantar Cuotas</h3>
                  <button
                    onClick={() => setAdelantoCuotas({ creditoId: '', monto: '', cuotasSeleccionadas: [] })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleAdelantarCuotas} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monto a Adelantar
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={adelantoCuotas.monto}
                      onChange={(e) => setAdelantoCuotas({
                        ...adelantoCuotas,
                        monto: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Seleccionar Cuotas a Adelantar
                    </label>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {creditos
                        .find(c => c.id === adelantoCuotas.creditoId)
                        ?.cuotas
                        .filter(c => !c.pagada)
                        .map((cuota) => (
                          <label key={cuota.numero} className="flex items-center space-x-3">
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
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              Cuota {cuota.numero} - ${cuota.cuota.toFixed(2)}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
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