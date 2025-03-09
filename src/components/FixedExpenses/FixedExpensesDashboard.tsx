import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Calendar, CheckCircle2, Clock, Filter } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface DateRange {
  start: Date;
  end: Date;
}

export const FixedExpensesDashboard: React.FC = () => {
  const { gastos = [] } = useStore();
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter fixed expenses with proper date handling
  const fixedExpenses = useMemo(() => {
    return gastos.filter(gasto => {
      try {
        // Ensure proper date conversion
        const gastoDate = gasto.fecha instanceof Date ? gasto.fecha : parseISO(gasto.fecha);
        
        return gasto.esFijo && 
          isWithinInterval(gastoDate, {
            start: selectedRange.start,
            end: selectedRange.end
          }) &&
          (selectedCategory === 'all' || gasto.categoria === selectedCategory);
      } catch (error) {
        console.error('Error processing date for gasto:', gasto);
        return false;
      }
    });
  }, [gastos, selectedRange, selectedCategory]);

  // Calculate totals with null checks
  const totalFixedExpenses = useMemo(() => 
    fixedExpenses.reduce((sum, gasto) => sum + (Number(gasto.monto) || 0), 0)
  , [fixedExpenses]);

  const totalPaid = useMemo(() => 
    fixedExpenses.reduce((sum, gasto) => sum + (Number(gasto.montoPagado) || 0), 0)
  , [fixedExpenses]);

  const percentagePaid = totalFixedExpenses > 0 ? (totalPaid / totalFixedExpenses) * 100 : 0;

  // Get unique categories with proper filtering
  const categories = useMemo(() => 
    Array.from(new Set(gastos
      .filter(g => g.esFijo && g.categoria)
      .map(g => g.categoria)))
      .filter(Boolean)
  , [gastos]);

  // Sort expenses by date
  const sortedExpenses = useMemo(() => 
    [...fixedExpenses].sort((a, b) => {
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);
      return dateA.getTime() - dateB.getTime();
    })
  , [fixedExpenses]);

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Gastos Fijos
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                value={format(selectedRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedRange({ ...selectedRange, start: new Date(e.target.value) })}
                className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-500">a</span>
              <input
                type="date"
                value={format(selectedRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedRange({ ...selectedRange, end: new Date(e.target.value) })}
                className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Total Gastos Fijos</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            ${totalFixedExpenses.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {fixedExpenses.length} gastos en el período
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Total Pagado</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${totalPaid.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {fixedExpenses.filter(g => g.estadoPago === 'pagado').length} gastos pagados
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Saldo Pendiente</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            ${(totalFixedExpenses - totalPaid).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {fixedExpenses.filter(g => g.estadoPago !== 'pagado').length} gastos pendientes
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Progreso de Pagos</h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {percentagePaid.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentagePaid}%` }}
          />
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detalle de Gastos Fijos</h3>
        {sortedExpenses.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No hay gastos fijos registrados en el período seleccionado
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pagado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pendiente
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedExpenses.map((gasto) => {
                  const montoPendiente = gasto.monto - (gasto.montoPagado || 0);
                  const isPaid = gasto.estadoPago === 'pagado';
                  const isOverdue = new Date(gasto.fecha) < new Date() && !isPaid;

                  return (
                    <tr key={gasto.id} className={isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isPaid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : isOverdue ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(gasto.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {gasto.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {gasto.categoria || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${gasto.monto.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                        ${(gasto.montoPagado || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                        ${montoPendiente.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};