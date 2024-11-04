import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calculator, Save, HelpCircle } from 'lucide-react';
import { Credito, CuotaCredito } from '../../types';
import { calcularCuotasFrances, calcularCuotasAleman, calcularCuotasTasaFija } from '../../utils/calculosCredito';

interface Props {
  onSave: (credito: Omit<Credito, 'id'>) => Promise<void>;
  loading?: boolean;
}

export const SimuladorCredito: React.FC<Props> = ({ onSave, loading }) => {
  const [formData, setFormData] = useState({
    montoSolicitado: '',
    entidadBancaria: '',
    tasaNominalAnual: '',
    mesesFinanciamiento: '',
    sistemaAmortizacion: 'frances' as 'frances' | 'aleman' | 'tasaFija',
    estado: 'simulacion' as 'simulacion' | 'activo',
    fechaSolicitud: format(new Date(), 'yyyy-MM-dd'),
  });

  const [cuotas, setCuotas] = useState<CuotaCredito[]>([]);
  const [showHelp, setShowHelp] = useState<string | null>(null);

  const sistemas = {
    frances: "Sistema Francés: Cuota fija durante todo el préstamo. Los intereses son mayores al inicio y disminuyen gradualmente.",
    aleman: "Sistema Alemán: Amortización constante del capital. Las cuotas son más altas al inicio y disminuyen con el tiempo.",
    tasaFija: "Sistema Tasa Fija: Se pagan solo intereses mensuales y el capital total al final del préstamo."
  };

  useEffect(() => {
    if (formData.montoSolicitado && formData.tasaNominalAnual && formData.mesesFinanciamiento) {
      const monto = parseFloat(formData.montoSolicitado);
      const tna = parseFloat(formData.tasaNominalAnual);
      const meses = parseInt(formData.mesesFinanciamiento);

      let nuevasCuotas: CuotaCredito[] = [];
      switch (formData.sistemaAmortizacion) {
        case 'frances':
          nuevasCuotas = calcularCuotasFrances(monto, tna, meses);
          break;
        case 'aleman':
          nuevasCuotas = calcularCuotasAleman(monto, tna, meses);
          break;
        case 'tasaFija':
          nuevasCuotas = calcularCuotasTasaFija(monto, tna, meses);
          break;
      }
      setCuotas(nuevasCuotas);
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cuotas.length > 0) {
      const creditoData: Omit<Credito, 'id'> = {
        montoSolicitado: parseFloat(formData.montoSolicitado),
        entidadBancaria: formData.entidadBancaria,
        tasaNominalAnual: parseFloat(formData.tasaNominalAnual),
        mesesFinanciamiento: parseInt(formData.mesesFinanciamiento),
        sistemaAmortizacion: formData.sistemaAmortizacion,
        estado: formData.estado,
        cuotas,
        fechaSolicitud: formData.estado === 'activo' ? new Date(formData.fechaSolicitud) : undefined,
        montoRestante: cuotas[cuotas.length - 1].saldoRestante,
        fechaUltimaCuota: cuotas[cuotas.length - 1].fecha,
        adelantos: []
      };
      await onSave(creditoData);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {formData.estado === 'simulacion' ? 'Simulador de Crédito' : 'Registrar Crédito'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'simulacion' | 'activo' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="simulacion">Simulación</option>
              <option value="activo">Crédito Tomado</option>
            </select>
          </div>

          {formData.estado === 'activo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Solicitud</label>
              <input
                type="date"
                value={formData.fechaSolicitud}
                onChange={(e) => setFormData({ ...formData, fechaSolicitud: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Monto Solicitado</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.montoSolicitado}
              onChange={(e) => setFormData({ ...formData, montoSolicitado: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Entidad Bancaria</label>
            <input
              type="text"
              value={formData.entidadBancaria}
              onChange={(e) => setFormData({ ...formData, entidadBancaria: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tasa Nominal Anual (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.tasaNominalAnual}
              onChange={(e) => setFormData({ ...formData, tasaNominalAnual: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Meses a Financiar</label>
            <input
              type="number"
              min="1"
              value={formData.mesesFinanciamiento}
              onChange={(e) => setFormData({ ...formData, mesesFinanciamiento: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Sistema de Amortización</label>
            <div className="flex items-center">
              <select
                value={formData.sistemaAmortizacion}
                onChange={(e) => setFormData({ ...formData, sistemaAmortizacion: e.target.value as 'frances' | 'aleman' | 'tasaFija' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="frances">Sistema Francés</option>
                <option value="aleman">Sistema Alemán</option>
                <option value="tasaFija">Tasa Fija</option>
              </select>
              <button
                type="button"
                onClick={() => setShowHelp(formData.sistemaAmortizacion)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
            {showHelp && (
              <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
                <p className="text-sm text-gray-600">{sistemas[showHelp]}</p>
                <button
                  type="button"
                  onClick={() => setShowHelp(null)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading || cuotas.length === 0}
          >
            {formData.estado === 'simulacion' ? (
              <>
                <Calculator className="mr-2 h-5 w-5" />
                Simular
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Guardar Crédito
              </>
            )}
          </button>
        </div>
      </form>

      {cuotas.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Plan de Pagos</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amortización</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interés</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cuotas.map((cuota) => (
                <tr key={cuota.numero}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cuota.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(cuota.fecha, 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${cuota.cuota.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${cuota.amortizacion.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${cuota.interes.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${cuota.saldoRestante.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};