import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Download, RefreshCw, Trash2, ArrowRightLeft, Edit2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransferenciaModalProps {
  categoriasIngreso: any[];
  onClose: () => void;
  onConfirm: (origen: string, destino: string, monto: number) => Promise<void>;
}

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
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Editar Cuenta</h3>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la Cuenta</label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransferenciaModal: React.FC<TransferenciaModalProps> = ({ categoriasIngreso, onClose, onConfirm }) => {
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
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Transferir entre Cuentas</h3>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cuenta Origen</label>
            <select
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar cuenta</option>
              {categoriasIngreso.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre} (${cat.saldo.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cuenta Destino</label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar cuenta</option>
              {categoriasIngreso.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre} (${cat.saldo.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
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
              {loading ? 'Procesando...' : 'Confirmar Transferencia'}
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

  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
  const totalGastosFijos = gastos.filter(g => g.esFijo).reduce((sum, g) => sum + g.monto, 0);
  const totalGastosVariables = gastos.filter(g => !g.esFijo).reduce((sum, g) => sum + g.monto, 0);
  const saldoDisponible = totalIngresos - (totalGastosFijos + totalGastosVariables);

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

      {/* Resumen de Cuentas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Cuentas</h2>

          
                     {/* Botón de Abrir Tutorial */}
    <button onClick={() => window.open('/tutorial-presupuesto.html', '_blank')} className="mb-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
      Abrir Tutorial
    </button>

          <button
            onClick={() => setMostrarTransferencia(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowRightLeft className="mr-2 h-5 w-5" />
            Transferir
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoriasIngreso.map((cuenta) => (
            <div key={cuenta.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">{cuenta.nombre}</h3>
                <button
                  onClick={() => setCuentaEditar(cuenta)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xl font-bold text-green-600">${cuenta.saldo.toFixed(2)}</p>
            </div>
          ))}
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
            <label className="block text-sm font-medium text-gray-700">Cuenta</label>
            <select
              value={nuevoIngreso.cuenta}
              onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, cuenta: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ingreso.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ingreso.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categoriasIngreso.find(cat => cat.id === ingreso.cuenta)?.nombre}
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
    </div>
  );
};