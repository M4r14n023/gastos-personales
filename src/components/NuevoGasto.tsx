import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { PlusCircle } from 'lucide-react';

export const NuevoGasto: React.FC = () => {
  const { mediosPago, categorias, agregarGasto, loading, error } = useStore();
  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    categoria: '',
    medioPago: '',
    cuotas: '1',
    esFijo: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agregarGasto({
        descripcion: formData.descripcion,
        monto: Number(formData.monto),
        fecha: new Date(),
        categoria: formData.categoria,
        medioPago: formData.medioPago,
        cuotas: Number(formData.cuotas),
        cuotaActual: 1,
        esFijo: formData.esFijo,
      });
      setFormData({
        descripcion: '',
        monto: '',
        categoria: '',
        medioPago: '',
        cuotas: '1',
        esFijo: false,
      });
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Nuevo Gasto</h2>
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.monto}
            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Medio de Pago</label>
          <select
            value={formData.medioPago}
            onChange={(e) => setFormData({ ...formData, medioPago: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="">Seleccionar medio de pago</option>
            {mediosPago.map((medio) => (
              <option key={medio.id} value={medio.id}>
                {medio.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cuotas</label>
          <input
            type="number"
            min="1"
            value={formData.cuotas}
            onChange={(e) => setFormData({ ...formData, cuotas: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.esFijo}
            onChange={(e) => setFormData({ ...formData, esFijo: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label className="ml-2 block text-sm text-gray-700">Gasto Fijo</label>
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          {loading ? 'Agregando...' : 'Agregar Gasto'}
        </button>
      </div>
    </form>
  );
};