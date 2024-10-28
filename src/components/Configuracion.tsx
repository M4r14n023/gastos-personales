import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2 } from 'lucide-react';

export const Configuracion: React.FC = () => {
  const { categorias, mediosPago, agregarCategoria, eliminarCategoria, agregarMedioPago, eliminarMedioPago } = useStore();
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevoMedioPago, setNuevoMedioPago] = useState({ nombre: '', tipo: 'efectivo' });

  const handleAgregarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaCategoria.trim()) {
      agregarCategoria({ nombre: nuevaCategoria.trim() });
      setNuevaCategoria('');
    }
  };

  const handleAgregarMedioPago = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoMedioPago.nombre.trim()) {
      agregarMedioPago(nuevoMedioPago);
      setNuevoMedioPago({ nombre: '', tipo: 'efectivo' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Categorías</h2>
        <form onSubmit={handleAgregarCategoria} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="Nueva categoría"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </form>
        <ul className="space-y-2">
          {categorias.map((categoria) => (
            <li key={categoria.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
              <span>{categoria.nombre}</span>
              <button
                onClick={() => eliminarCategoria(categoria.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Medios de Pago</h2>
        <form onSubmit={handleAgregarMedioPago} className="mb-4 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoMedioPago.nombre}
              onChange={(e) => setNuevoMedioPago({ ...nuevoMedioPago, nombre: e.target.value })}
              placeholder="Nuevo medio de pago"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <select
              value={nuevoMedioPago.tipo}
              onChange={(e) => setNuevoMedioPago({ ...nuevoMedioPago, tipo: e.target.value as any })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </form>
        <ul className="space-y-2">
          {mediosPago.map((medio) => (
            <li key={medio.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
              <span>{medio.nombre} ({medio.tipo})</span>
              <button
                onClick={() => eliminarMedioPago(medio.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};