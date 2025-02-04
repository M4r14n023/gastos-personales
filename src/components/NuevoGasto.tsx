import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { PlusCircle } from 'lucide-react';

export const NuevoGasto: React.FC = () => {
  const { categoriasIngreso = [], agregarGasto, loading, error } = useStore();
  const [esFijo, setEsFijo] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    fechaVencimiento: '',
    cuenta: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agregarGasto({
        descripcion: formData.descripcion,
        monto: Number(formData.monto),
        fecha: esFijo ? new Date(formData.fechaVencimiento) : new Date(),
        esFijo,
        estadoPago: esFijo ? 'pendiente' : 'pagado',
        montoPagado: esFijo ? 0 : Number(formData.monto),
        cuenta: formData.cuenta,
      });

      setFormData({
        descripcion: '',
        monto: '',
        fechaVencimiento: '',
        cuenta: '',
      });
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Nuevo Gasto</h2>
      {error && (
        <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={esFijo}
            onChange={(e) => setEsFijo(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-400 dark:border-gray-600 rounded shadow-sm"
            disabled={loading}
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Gasto Fijo</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="mt-1 block w-full form-input-enhanced rounded-md dark:bg-gray-700 dark:text-white"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.monto}
            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            className="mt-1 block w-full form-input-enhanced rounded-md dark:bg-gray-700 dark:text-white"
            required
            disabled={loading}
          />
        </div>

        {esFijo ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Vencimiento</label>
            <input
              type="date"
              value={formData.fechaVencimiento}
              onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
              className="mt-1 block w-full form-input-enhanced rounded-md dark:bg-gray-700 dark:text-white"
              required
              disabled={loading}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuenta</label>
            <select
              value={formData.cuenta}
              onChange={(e) => setFormData({ ...formData, cuenta: e.target.value })}
              className="mt-1 block w-full form-input-enhanced rounded-md dark:bg-gray-700 dark:text-white"
              required
              disabled={loading}
            >
              <option value="">Seleccionar cuenta</option>
              {categoriasIngreso.map((cuenta) => {
                const saldoInsuficiente = cuenta.saldo < Number(formData.monto);
                return (
                  <option 
                    key={cuenta.id} 
                    value={cuenta.id}
                    disabled={saldoInsuficiente}
                    className={saldoInsuficiente ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                  >
                    {cuenta.nombre} (Saldo: ${(cuenta.saldo || 0).toFixed(2)})
                    {saldoInsuficiente ? ' - Saldo insuficiente' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
          disabled={loading || (!esFijo && Number(formData.monto) > 0 && formData.cuenta && categoriasIngreso.find(c => c.id === formData.cuenta)?.saldo < Number(formData.monto))}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          {loading ? 'Agregando...' : 'Agregar Gasto'}
        </button>
      </div>
    </form>
  );
};
