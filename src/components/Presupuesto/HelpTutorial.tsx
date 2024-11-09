import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTutorialProps {
  onClose: () => void;
}

export const HelpTutorial: React.FC<HelpTutorialProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <HelpCircle className="h-6 w-6 mr-2 text-blue-500" />
            Tutorial de Presupuesto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Resumen de Presupuesto</h4>
            <p className="mb-2">El panel superior muestra cuatro indicadores importantes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-green-600 font-semibold">Total Ingresos:</span> Suma de todos los ingresos registrados</li>
              <li><span className="text-blue-600 font-semibold">Gastos Fijos:</span> Total de gastos recurrentes mensuales</li>
              <li><span className="text-orange-600 font-semibold">Gastos Variables:</span> Total de gastos no recurrentes</li>
              <li><span className="font-semibold">Saldo Disponible:</span> Diferencia entre ingresos y gastos totales</li>
            </ul>
          </section>

          <section>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Gestión de Cuentas</h4>
            <p className="mb-2">Las cuentas te permiten organizar tu dinero en diferentes categorías:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Crea nuevas cuentas usando el botón "Nueva Cuenta"</li>
              <li>Cada cuenta muestra su saldo actual</li>
              <li>Puedes editar el nombre de una cuenta usando el ícono de lápiz</li>
              <li>Usa el botón "Transferir" para mover dinero entre cuentas</li>
            </ul>
          </section>

          <section>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Registro de Ingresos</h4>
            <p className="mb-2">Para registrar un nuevo ingreso:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Completa la descripción del ingreso</li>
              <li>Ingresa el monto recibido</li>
              <li>Selecciona la cuenta donde se depositará el dinero</li>
              <li>Presiona "Agregar Ingreso" para registrarlo</li>
            </ol>
          </section>

          <section>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Transferencias entre Cuentas</h4>
            <p className="mb-2">Para transferir dinero:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Haz clic en el botón "Transferir"</li>
              <li>Selecciona la cuenta de origen</li>
              <li>Selecciona la cuenta de destino</li>
              <li>Ingresa el monto a transferir</li>
              <li>Confirma la transferencia</li>
            </ol>
          </section>

          <section>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Cierre de Balance</h4>
            <p className="mb-2">El cierre de balance es una función importante:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Consolida todos los movimientos del período</li>
              <li>Reinicia los gastos variables e ingresos</li>
              <li>Mantiene un registro histórico de tus finanzas</li>
              <li>Se recomienda realizar el cierre mensualmente</li>
            </ul>
            <p className="mt-2 text-yellow-600 dark:text-yellow-400">
              ⚠️ Nota: El cierre de balance es irreversible. Asegúrate de revisar todos los movimientos antes de realizarlo.
            </p>
          </section>

          <section>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Consejos Adicionales</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mantén tus cuentas actualizadas regularmente</li>
              <li>Revisa el saldo disponible antes de registrar gastos</li>
              <li>Utiliza descripciones claras para facilitar el seguimiento</li>
              <li>Realiza cierres de balance periódicos para mantener un registro ordenado</li>
            </ul>
          </section>
          
    <section>
    <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Gastos con Tarjeta de Credito</h4>
            <ul className="list-disc pl-5 space-y-1">
      <li><strong>Crear o Renombrar la Cuenta</strong>: Entra a la sección Presupuesto. Crea una cuenta nueva o renombra una cuenta existente, asignándole el nombre <em>Tarjeta de Crédito</em> o cualquier otro que prefieras para identificarla.</li>
      <li><strong>Agregar el Monto a Pagar</strong>: Añade el monto que vas a pagar desde la cuenta <em>Tarjeta de Crédito</em>. Esto representará el saldo disponible que se usará para cubrir los gastos.</li>
      <li><strong>Registrar el Gasto</strong>: Dirígete a la opción <em>Cargar Gasto</em>. En el campo de descripción, ingresa una nota que identifique el gasto (por ejemplo, "Compra de alimentos" o "Suscripción de streaming"). Selecciona la cuenta <em>Tarjeta de Crédito</em> como el origen del gasto.</li>
      <li><strong>Verifica el Resultado</strong>: Al guardar el gasto, este aparecerá en la lista de gastos con los detalles que ingresaste. La cuenta <em>Tarjeta de Crédito</em> se ajustará automáticamente, quedando en $0 para que no interfiera con el saldo total disponible en tus otras cuentas.</li>
      </ul>
    </section>






        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};