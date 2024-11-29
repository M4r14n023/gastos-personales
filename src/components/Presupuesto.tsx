import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Download, RefreshCw, Trash2, ArrowRightLeft, Edit2, HelpCircle } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { HelpTutorial } from './Presupuesto/HelpTutorial';
import { TransferenciaModal } from './Presupuesto/TransferenciaModal';

interface EditarCuentaModalProps {
  cuenta: any;
  onClose: () => void;
  onConfirm: (id: string, nuevoNombre: string) => Promise<void>;
}

const EditarCuentaModal: React.FC<EditarCuentaModalProps> = ({ cuenta, onClose, onConfirm }) => {
  const [nuevoNombre, setNuevoNombre] = useState(cuenta.nombre);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(cuenta.id, nuevoNombre.trim());
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
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Editar Cuenta</h3>
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Cuenta</label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Presupuesto: React.FC = () => {
  const { 
    ingresos, 
    gastos, 
    categoriasIngreso, 
    agregarIngreso, 
    eliminarIngreso,
    agregarCategoriaIngreso,
    editarCategoriaIngreso,
    transferirEntreCuentas,
    generarCierreBalance,
    loading,
    error 
  } = useStore();

  const [nuevoIngreso, setNuevoIngreso] = useState({
    descripcion: '',
    monto: '',
    cuenta: ''
  });

  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [mostrarTransferencia, setMostrarTransferencia] = useState(false);
  const [cuentaEditar, setCuentaEditar] = useState<any>(null);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  // Calculate totals according to new rules
  const totalCuentas = categoriasIngreso.reduce((sum, cuenta) => sum + cuenta.saldo, 0);
  const totalGastosFijos = gastos.filter(g => g.esFijo).reduce((sum, g) => sum + g.monto, 0);
  const totalGastosVariables = gastos.filter(g => !g.esFijo).reduce((sum, g) => sum + g.monto, 0);
  const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
  const saldoDisponible = totalCuentas - (totalGastosFijos + totalGastosVariables);

  const handleSubmitIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoIngreso.descripcion && nuevoIngreso.monto && nuevoIngreso.cuenta) {
      try {
        await agregarIngreso({
          descripcion: nuevoIngreso.descripcion,
          monto: Number(nuevoIngreso.monto),
          cuenta: nuevoIngreso.cuenta,
          fecha: new Date()
        });
        setNuevoIngreso({ descripcion: '', monto: '', cuenta: '' });
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleSubmitCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaCategoria.trim()) {
      try {
        await agregarCategoriaIngreso({ nombre: nuevaCategoria.trim(), saldo: 0 });
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

  const handleTransferencia = async (origen: string, destino: string, monto: number) => {
    try {
      await transferirEntreCuentas(origen, destino, monto);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleEditarCuenta = async (id: string, nuevoNombre: string) => {
    try {
      await editarCategoriaIngreso(id, nuevoNombre);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const formatDate = (date: Date | string | number | undefined) => {
    if (!date) return 'Fecha no disponible';
    try {
      const parsedDate = date instanceof Date ? date : new Date(date);
      if (isValid(parsedDate)) {
        return format(parsedDate, 'dd/MM/yyyy', { locale: es });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    return 'Fecha inválida';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setMostrarAyuda(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <HelpCircle className="h-5 w-5 mr-2" />
          Tutorial
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Resumen de Presupuesto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Total Ingresos</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Gastos Fijos</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalGastosFijos.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Gastos Variables</h3>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">${totalGastosVariables.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Saldo Disponible</h3>
          <p className={`text-2xl font-bold ${saldoDisponible >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${saldoDisponible.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Resumen de Cuentas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Cuentas</h2>
          <button
            onClick={() => setMostrarTransferencia(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowRightLeft className="h-5 w-5 mr-2" />
            Transferir
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoriasIngreso.map((cuenta) => (
            <div key={cuenta.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">{cuenta.nombre}</h3>
                <button
                  onClick={() => setCuentaEditar(cuenta)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">${cuenta.saldo.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de Nuevo Ingreso */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nuevo Ingreso</h2>
          <button
            onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {mostrarFormCategoria ? 'Cancelar' : 'Nueva Cuenta'}
          </button>
        </div>

        {mostrarFormCategoria && (
          <form onSubmit={handleSubmitCategoria} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                placeholder="Nombre de la cuenta"
                className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <input
              type="text"
              value={nuevoIngreso.descripcion}
              onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, descripcion: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
              value={nuevoIngreso.monto}
              onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, monto: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuenta</label>
            <select
              value={nuevoIngreso.cuenta}
              onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, cuenta: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={loading}
            >
              <option value="">Seleccionar cuenta</option>
              {categoriasIngreso.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            <Plus className="mr-2 h-5 w-5" />
            {loading ? 'Agregando...' : 'Agregar Ingreso'}
          </button>
        </form>
      </div>

      {/* Lista de Ingresos */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Ingresos Registrados</h2>
          <button
            onClick={handleCierreBalance}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Cierre de Balance
          </button>
        </div>
        
        {ingresos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay ingresos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cuenta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(ingreso.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {ingreso.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {categoriasIngreso.find(cat => cat.id === ingreso.cuenta)?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">
                      ${ingreso.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => eliminarIngreso(ingreso.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
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

      {mostrarTransferencia && (
        <TransferenciaModal
          categoriasIngreso={categoriasIngreso}
          onClose={() => setMostrarTransferencia(false)}
          onConfirm={handleTransferencia}
        />
      )}

      {cuentaEditar && (
        <EditarCuentaModal
          cuenta={cuentaEditar}
          onClose={() => setCuentaEditar(null)}
          onConfirm={handleEditarCuenta}
        />
      )}

      {mostrarAyuda && (
        <HelpTutorial onClose={() => setMostrarAyuda(false)} />
      )}
    </div>
  );
};