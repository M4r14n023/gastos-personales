import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { CategoriaIngreso } from '../../types';

interface TransferenciaModalProps {
  categoriasIngreso: CategoriaIngreso[];
  onClose: () => void;
  onConfirm: (origen: string, destino: string, monto: number) => Promise<void>;
}

export const TransferenciaModal: React.FC<TransferenciaModalProps> = ({ categoriasIngreso, onClose, onConfirm }) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origen || !destino || !monto) {
      setError('Todos los campos son requeridos');
      return;
    }
    if (origen === destino) {
      setError('Las cuentas deben ser diferentes');
      return;
    }
    if (Number(monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(origen, destino, Number(monto));
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Transferir entre Cuentas</h3>
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuenta Origen</label>
            <select
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuenta Destino</label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
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
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              {loading ? 'Procesando...' : 'Confirmar Transferencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};