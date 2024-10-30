import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { NuevoGasto } from './NuevoGasto';
import { ListaGastos } from './ListaGastos';
import { Configuracion } from './Configuracion';
import { Resumen } from './Resumen';
import { Presupuesto } from './Presupuesto';
import { Balances } from './Balances';
import { ThemeToggle } from './ThemeToggle';
import { useStore } from '../store/useStore';
import { auth } from '../config/firebase';
import { LayoutGrid, Settings, PlusCircle, List, LogOut, Wallet, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { cargarGastos, initializeUserData, initialized } = useStore();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  useEffect(() => {
    const initData = async () => {
      if (!initialized) {
        try {
          await initializeUserData();
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      } else {
        await cargarGastos();
      }
    };
    
    initData();
  }, [initialized]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutGrid },
    { id: 'nuevo', name: 'Nuevo Gasto', icon: PlusCircle },
    { id: 'lista', name: 'Lista de Gastos', icon: List },
    { id: 'presupuesto', name: 'Presupuesto', icon: Wallet },
    { id: 'balances', name: 'Balances', icon: FileText },
    { id: 'config', name: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Gastos</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                        }
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      `}
                    >
                      <Icon
                        className={`
                          ${
                            activeTab === tab.id
                              ? 'text-blue-500 dark:text-blue-400'
                              : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                          }
                          -ml-0.5 mr-2 h-5 w-5
                        `}
                      />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <Resumen />
              <ListaGastos />
            </div>
          )}
          {activeTab === 'nuevo' && <NuevoGasto />}
          {activeTab === 'lista' && <ListaGastos />}
          {activeTab === 'presupuesto' && <Presupuesto />}
          {activeTab === 'balances' && <Balances />}
          {activeTab === 'config' && <Configuracion />}
        </main>
      </div>

      <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Gestión de Gastos. Desarrollado por Mariano Lumbreras
          </p>
        </div>
      </footer>
    </div>
  );
};