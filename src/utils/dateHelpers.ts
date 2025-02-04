import { format, isValid, parse, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, 'dd/MM/yyyy', { locale: es });
  } catch {
    return '-';
  }
};

export const parseDate = (dateString: string): Date | null => {
  try {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    if (!isValid(parsedDate) || isFuture(parsedDate)) {
      return null;
    }
    return parsedDate;
  } catch {
    return null;
  }
};

export const validateDate = (date: Date | string | undefined): boolean => {
  if (!date) return false;
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValid(dateObj) && !isFuture(dateObj);
  } catch {
    return false;
  }
};