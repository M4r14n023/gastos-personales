import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const VenderDolares: React.FC<Props> = ({ onClose }) => {
  const { categoriasIngreso, saldoDolares, venderDolares, loading } = useStore();
  const [formData, setFormData] = useState({
    montoDolares: '',
    cotizacion: '',
    cuenta: ''
  });
  const [error, setError] = useState('');

  const montoPesos = Number(formData.montoDolares) * Number(formData.cotizacion);
  const saldoInsuficiente = Number(formData.montoDolares) > saldoDolares;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.montoDolares || !formData.cotizacion || !formData.cuenta) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      await venderDolares({
        montoDolares: Number(formData.montoDolares),
        cotizacion: Number(formData.cotizacion),
        cuenta: formData.cuenta
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vender Dólares</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto en Dólares
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={saldoDolares}
              value={formData.montoDolares}
              onChange={(e) => setFormData({ ...formData, montoDolares: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Saldo disponible: USD {saldoDolares.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cotización (ARS)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.cotizacion}
              onChange={(e) => setFormData({ ...formData, cotizacion: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cuenta Destino (ARS)
            </label>
            <select
              value={formData.cuenta}
              onChange={(e) => setFormData({ ...formData, cuenta: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Seleccionar cuenta</option>
              {categoriasIngreso.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre}
                </option>
              ))}
            </select>
          </div>

          {formData.montoDolares && formData.cotizacion && formData.cuenta && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resumen de la operación
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>Monto a debitar: USD {Number(formData.montoDolares).toFixed(2)}</p>
                <p>Monto a recibir: ${montoPesos.toFixed(2)}</p>
                <p>Cuenta destino: {categoriasIngreso.find(c => c.id === formData.cuenta)?.nombre}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.montoDolares || !formData.cotizacion || !formData.cuenta || saldoInsuficiente}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </form>
      </div>
    </div>
  );
};