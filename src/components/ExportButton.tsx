import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { generateCSVContent, generateFileName } from '../utils/exportHelpers';

interface ExportButtonProps {
  movimientos?: any[];
  gastos?: any[];
  onExportSuccess: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ movimientos, gastos, onExportSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const dataToExport = movimientos || gastos;
    if (!dataToExport || dataToExport.length === 0) return;
    
    setLoading(true);
    try {
      const csvContent = generateCSVContent(dataToExport);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', generateFileName('csv'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onExportSuccess();
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dataToExport = movimientos || gastos;
  const isDisabled = loading || !dataToExport || dataToExport.length === 0;

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
    >
      <Download className="mr-2 h-5 w-5" />
      {loading ? 'Exportando...' : 'Exportar CSV'}
    </button>
  );
};