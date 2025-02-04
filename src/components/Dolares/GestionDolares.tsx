import React, { useState } from 'react';
import { DollarSign, ArrowDownCircle, ArrowUpCircle, CreditCard } from 'lucide-react';
import { HistorialMovimientos } from './HistorialMovimientos';
import { ComprarDolares } from './ComprarDolares';
import { VenderDolares } from './VenderDolares';
import { PagarDolares } from './PagarDolares';
import { useStore } from '../../store/useStore';
import { ExportButton } from '../ExportButton';

export const GestionDolares: React.FC = () => {
  const { saldoDolares = 0, movimientosDolares = [], loading } = useStore();
  const [modalActivo, setModalActivo] = useState<'comprar' | 'vender' | 'pagar' | null>(null);

  return (
    <div className="space-y-6">
      {/* Saldo y Acciones */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500 mr-2" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Saldo en Dólares</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                USD {saldoDolares.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setModalActivo('comprar')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowDownCircle className="h-5 w-5 mr-2" />
              Comprar
            </button>
            <button
              onClick={() => setModalActivo('vender')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <ArrowUpCircle className="h-5 w-5 mr-2" />
              Vender
            </button>
            <button
              onClick={() => setModalActivo('pagar')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Pagar
            </button>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Historial de Movimientos</h2>
          <ExportButton
            movimientos={movimientosDolares}
            onExportSuccess={() => {}}
          />
        </div>
        <HistorialMovimientos movimientos={movimientosDolares} loading={loading} />
      </div>

      {/* Modales */}
      {modalActivo === 'comprar' && (
        <ComprarDolares onClose={() => setModalActivo(null)} />
      )}
      {modalActivo === 'vender' && (
        <VenderDolares onClose={() => setModalActivo(null)} />
      )}
      {modalActivo === 'pagar' && (
        <PagarDolares onClose={() => setModalActivo(null)} />
      )}
    </div>
  );
};