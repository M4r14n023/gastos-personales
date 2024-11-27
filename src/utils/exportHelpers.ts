import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Gasto } from '../types';

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    return format(dateObj, 'dd/MM/yyyy', { locale: es });
  } catch {
    return '-';
  }
};

export const generateFileName = (type: 'csv' | 'pdf'): string => {
  const date = format(new Date(), 'yyyy-MM-dd', { locale: es });
  return `gastos_${date}.${type}`;
};

export const sortExpensesByDate = (gastos: Gasto[]): Gasto[] => {
  return [...gastos].sort((a, b) => {
    const dateA = a.fecha instanceof Date ? a.fecha : new Date(a.fecha);
    const dateB = b.fecha instanceof Date ? b.fecha : new Date(b.fecha);
    return dateB.getTime() - dateA.getTime();
  });
};

export const generateCSVContent = (gastos: Gasto[]): string => {
  const headers = ['Fecha', 'Descripción', 'Monto', 'Estado', 'Tipo', 'Pagado'];
  const rows = sortExpensesByDate(gastos).map(gasto => [
    formatDate(gasto.fecha),
    gasto.descripcion,
    gasto.monto.toFixed(2),
    gasto.estadoPago,
    gasto.esFijo ? 'Fijo' : 'Variable',
    gasto.montoPagado.toFixed(2)
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};