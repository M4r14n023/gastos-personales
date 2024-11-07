import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Gasto } from '../types';

interface PagoModalProps {
  gasto: Gasto;
  onClose: () => void;
  onConfirm: (monto: number, cuenta: string) => Promise<void>;
  categoriasIngreso: Array<{ id: string; nombre: string; saldo: number; }>;
}

const PagoModal: React.FC<PagoModalProps> = ({ gasto, onClose, onConfirm, categoriasIngreso }) => {
  const [monto, setMonto] = useState(gasto.monto - (gasto.montoPagado || 0));
  const [cuenta, setCuenta] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuenta) {
      setError('Seleccione una cuenta');
      return;
    }
    if (monto <= 0 || monto > (gasto.monto - (gasto.montoPagado || 0))) {
      setError('Monto inválido');
      return;
    }
    
    setLoading(true);
    try {
      await onConfirm(monto, cuenta);
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Registrar Pago</h3>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto a Pagar</label>
            <input
              type="number"
              step="0.01"
              max={gasto.monto - (gasto.montoPagado || 0)}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Monto pendiente: ${(gasto.monto - (gasto.montoPagado || 0)).toFixed(2)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cuenta</label>
            <select
              value={cuenta}
              onChange={(e) => setCuenta(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar cuenta</option>
              {categoriasIngreso.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre} (${(cat.saldo || 0).toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ListaGastos: React.FC = () => {
  const { 
    gastos = [], 
    categorias = [], 
    mediosPago = [], 
    categoriasIngreso = [],
    eliminarGasto, 
    registrarPago,
    loading, 
    error 
  } = useStore();

  const [gastoSeleccionado, setGastoSeleccionado] = useState<Gasto | null>(null);

  const getCategoriaNombre = (id: string | undefined) => 
    id ? categorias.find(cat => cat.id === id)?.nombre || 'Desconocida' : 'Desconocida';

  const getMedioPagoNombre = (id: string | undefined) =>
    id ? mediosPago.find(medio => medio.id === id)?.nombre || 'Desconocido' : 'Desconocido';

  const handlePago = async (monto: number, cuenta: string) => {
    if (gastoSeleccionado) {
      await registrarPago(gastoSeleccionado.id, monto, cuenta);
      setGastoSeleccionado(null);
    }
  };

  const getEstadoPagoIcon = (gasto: Gasto) => {
    switch (gasto.estadoPago) {
      case 'pagado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'parcial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string | number | undefined) => {
    if (!date) return 'Fecha no disponible';
    const parsedDate = date instanceof Date ? date : new Date(date);
    return isValid(parsedDate) ? format(parsedDate, 'dd/MM/yyyy', { locale: es }) : 'Fecha inválida';
  };

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pagado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pendiente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Medio de Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cuotas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {gastos.map((gasto) => (
                <tr key={gasto.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setGastoSeleccionado(gasto)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full"
                    >
                      {getEstadoPagoIcon(gasto)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(gasto.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {gasto.descripcion || 'Sin descripción'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${(gasto.monto || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                    ${(gasto.montoPagado || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                    ${((gasto.monto || 0) - (gasto.montoPagado || 0)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getCategoriaNombre(gasto.categoria)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getMedioPagoNombre(gasto.medioPago)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {gasto.cuotas && gasto.cuotas > 1 ? `${gasto.cuotaActual || 0}/${gasto.cuotas}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {gasto.esFijo ? 'Fijo' : 'Variable'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => gasto.id && eliminarGasto(gasto.id)}
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

      {gastoSeleccionado && (
        <PagoModal
          gasto={gastoSeleccionado}
          onClose={() => setGastoSeleccionado(null)}
          onConfirm={handlePago}
          categoriasIngreso={categoriasIngreso}
        />
      )}
    </div>
  );
};