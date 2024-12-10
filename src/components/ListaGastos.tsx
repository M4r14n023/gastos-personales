import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface PagoModalProps {
  gasto: any;
  onClose: () => void;
  onConfirm: (monto: number, cuenta: string) => Promise<void>;
  categoriasIngreso: any[];
}

const PagoModal: React.FC<PagoModalProps> = ({ gasto, onClose, onConfirm, categoriasIngreso }) => {
  const [monto, setMonto] = useState(gasto.monto - gasto.montoPagado);
  const [cuenta, setCuenta] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuenta) {
      setError('Seleccione una cuenta');
      return;
    }
    if (monto <= 0 || monto > (gasto.monto - gasto.montoPagado)) {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Registrar Pago</h3>
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto a Pagar</label>
            <input
              type="number"
              step="0.01"
              max={gasto.monto - gasto.montoPagado}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monto pendiente: ${(gasto.monto - gasto.montoPagado).toFixed(2)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuenta</label>
            <select
              value={cuenta}
              onChange={(e) => setCuenta(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Seleccionar cuenta</option>
              {categoriasIngreso.map((cat) => {
                const saldoInsuficiente = cat.saldo < monto;
                return (
                  <option 
                    key={cat.id} 
                    value={cat.id}
                    disabled={saldoInsuficiente}
                    className={saldoInsuficiente ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                  >
                    {cat.nombre} (${(cat.saldo || 0).toFixed(2)})
                    {saldoInsuficiente ? ' - Saldo insuficiente' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (monto > 0 && cuenta && categoriasIngreso.find(c => c.id === cuenta)?.saldo < monto)}
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
    categoriasIngreso = [],
    eliminarGasto, 
    registrarPago,
    loading, 
    error 
  } = useStore();

  const [gastoSeleccionado, setGastoSeleccionado] = useState<any>(null);

  const handlePago = async (monto: number, cuenta: string) => {
    if (gastoSeleccionado) {
      await registrarPago(gastoSeleccionado.id, monto, cuenta);
      setGastoSeleccionado(null);
    }
  };

  const getEstadoPagoIcon = (gasto: any) => {
    if (gasto.esFijo && gasto.estadoPago === 'pendiente') {
      return <Clock className="h-5 w-5 text-orange-500" />;
    }
    switch (gasto.estadoPago) {
      case 'pagado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'parcial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const getCuentaNombre = (cuentaId: string) => {
    const cuenta = categoriasIngreso.find(c => c.id === cuentaId);
    return cuenta ? cuenta.nombre : 'N/A';
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cuenta</th>
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
                      title={gasto.esFijo ? 'Gasto Fijo' : 'Gasto Variable'}
                    >
                      {getEstadoPagoIcon(gasto)}
                    </button>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${gasto.esFijo ? 'text-orange-600' : 'text-blue-600'}`}>
                    {formatDate(gasto.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {gasto.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${gasto.monto.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                    ${gasto.montoPagado.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                    ${(gasto.monto - gasto.montoPagado).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {gasto.cuenta ? getCuentaNombre(gasto.cuenta) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {gasto.esFijo ? 'Fijo' : 'Variable'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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