import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Presupuesto: React.FC = () => {
  const { 
    ingresos, 
    gastos, 
    categoriasIngreso, 
    agregarIngreso, 
    eliminarIngreso,
    agregarCategoriaIngreso,
    generarCierreBalance,
    loading,
    error 
  } = useStore();

  const [nuevoIngreso, setNuevoIngreso] = useState({
    descripcion: '',
    monto: '',
    categoria: ''
  });

  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);

  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
  const totalGastosFijos = gastos.filter(g => g.esFijo).reduce((sum, g) => sum + g.monto, 0);
  const totalGastosVariables = gastos.filter(g => !g.esFijo).reduce((sum, g) => sum + g.monto, 0);
  const saldoDisponible = totalIngresos - (totalGastosFijos + totalGastosVariables);

  const handleSubmitIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoIngreso.descripcion && nuevoIngreso.monto && nuevoIngreso.categoria) {
      try {
        await agregarIngreso({
          descripcion: nuevoIngreso.descripcion,
          monto: Number(nuevoIngreso.monto),
          categoria: nuevoIngreso.categoria,
          fecha: new Date()
        });
        setNuevoIngreso({ descripcion: '', monto: '', categoria: '' });
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleSubmitCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaCategoria.trim()) {
      try {
        await agregarCategoriaIngreso({ nombre: nuevaCategoria.trim() });
        setNuevaCategoria('');
        setMostrarFormCategoria(false);
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleCierreBalance = async () => {
    if (window.confirm('¿Estás seguro de que deseas realizar el cierre de balance? Esta acción reiniciará todos los gastos variables e ingresos.')) {
      try {
        await generarCierreBalance();
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Resumen de Presupuesto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Ingresos</h3>
          <p className="text-2xl font-bold text-green-600">${totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Gastos Fijos</h3>
          <p className="text-2xl font-bold text-blue-600">${totalGastosFijos.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Gastos Variables</h3>
          <p className="text-2xl font-bold text-orange-600">${totalGastosVariables.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Saldo Disponible</h3>
          <p className={`text-2xl font-bold ${saldoDisponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${saldoDisponible.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Formulario de Nuevo Ingreso */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Nuevo Ingreso</h2>
          <button
            onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)}
            className="text-blue-600 hover:text-blue-800"
          >
            {mostrarFormCategoria ? 'Cancelar' : 'Nueva Categoría'}
          </button>
        </div>

        {mostrarFormCategoria && (
          <form onSubmit={handleSubmitCategoria} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                placeholder="Nombre de la categoría"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar
              </button>
            </div>
          </form>
        )}

        <form onSubmit={handleSubmitIngreso} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input
              type="text"
              value={nuevoIngreso.descripcion}
              onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, descripcion: e.target.value })}
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
              value={nuevoIngreso.monto}
              onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, monto: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              value={nuevoIngreso.categoria}
              onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, categoria: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Seleccionar categoría</option>
              {categoriasIngreso.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            <Plus className="mr-2 h-5 w-5" />
            {loading ? 'Agregando...' : 'Agregar Ingreso'}
          </button>
        </form>
      </div>

      {/* Lista de Ingresos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Ingresos Registrados</h2>
          <button
            onClick={handleCierreBalance}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Cierre de Balance
          </button>
        </div>
        
        {ingresos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay ingresos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(ingreso.fecha instanceof Date ? ingreso.fecha : new Date(ingreso.fecha), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ingreso.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categoriasIngreso.find(cat => cat.id === ingreso.categoria)?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      ${ingreso.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => eliminarIngreso(ingreso.id)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
      </div>
    </div>
  );
};