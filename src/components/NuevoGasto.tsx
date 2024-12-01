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

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fechaActual = new Date();
    try {
      await agregarGasto({
        descripcion: formData.descripcion,
        monto: Number(formData.monto),
        fechaCreacion: fechaActual,
        fechaVencimiento: esFijo ? new Date(formData.fechaVencimiento) : fechaActual,
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
    } catch {
      // Error handling
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex justify-between items-center">
          Nuevo Gasto
        </h2>
        {error && <div className="text-red-600">{error}</div>}

        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={esFijo}
              onChange={(e) => setEsFijo(e.target.checked)}
              className="h-4 w-4"
              disabled={loading}
            />
            <label className="ml-2 text-sm">Gasto Fijo</label>
          </div>

          <div>
            <label>Descripción</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label>Monto</label>
            <input
              type="number"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          {esFijo && (
            <div>
              <label>Fecha de Vencimiento</label>
              <input
                type="date"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                required
                disabled={loading}
                className="w-full"
              />
            </div>
          )}

          {!esFijo && (
            <div>
              <label>Cuenta</label>
              <select
                value={formData.cuenta}
                onChange={(e) => setFormData({ ...formData, cuenta: e.target.value })}
                required
                disabled={loading}
                className="w-full"
              >
                <option value="">Seleccionar cuenta</option>
                {categoriasIngreso.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.nombre} (Saldo: ${cuenta.saldo})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            <PlusCircle className="mr-2" />
            Agregar Gasto
          </button>
        </div>
      </form>
    </div>
  );
};
