import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { collection, doc, writeBatch, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { CategoriaIngreso, Gasto } from '../types';

interface State {
  gastos: Gasto[];
  categorias: { id: string; nombre: string; }[];
  mediosPago: { id: string; nombre: string; tipo: string; }[];
  categoriasIngreso: CategoriaIngreso[];
  ingresos: any[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  balances: any[];

  agregarGasto: (gasto: {
    descripcion: string;
    monto: number;
    fecha: Date;
    esFijo: boolean;
    estadoPago: 'pendiente' | 'pagado';
    montoPagado: number;
    cuenta?: string;
  }) => Promise<void>;

  cargarGastos: () => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  registrarPago: (id: string, monto: number, cuenta: string) => Promise<void>;
  agregarCategoria: (categoria: { nombre: string }) => Promise<void>;
  eliminarCategoria: (id: string) => Promise<void>;
  agregarMedioPago: (medioPago: { nombre: string; tipo: string }) => Promise<void>;
  eliminarMedioPago: (id: string) => Promise<void>;
  agregarCategoriaIngreso: (categoria: { nombre: string; saldo: number }) => Promise<void>;
  agregarIngreso: (ingreso: any) => Promise<void>;
  eliminarIngreso: (id: string) => Promise<void>;
  transferirEntreCuentas: (origen: string, destino: string, monto: number) => Promise<void>;
  generarCierreBalance: () => Promise<void>;
  initializeUserData: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  gastos: [],
  categorias: [],
  mediosPago: [],
  categoriasIngreso: [],
  ingresos: [],
  balances: [],
  loading: false,
  error: null,
  initialized: false,

  agregarGasto: async (gasto) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const batch = writeBatch(db);
      
      const gastoRef = doc(collection(db, 'gastos'));
      batch.set(gastoRef, {
        ...gasto,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      if (!gasto.esFijo && gasto.cuenta) {
        const cuentaRef = doc(db, 'categoriasIngreso', gasto.cuenta);
        const cuentaDoc = await getDocs(query(collection(db, 'categoriasIngreso'), where('id', '==', gasto.cuenta)));
        
        if (!cuentaDoc.empty) {
          const cuenta = cuentaDoc.docs[0].data() as CategoriaIngreso;
          if (cuenta.saldo < gasto.monto) {
            throw new Error('Saldo insuficiente en la cuenta');
          }
          
          batch.update(cuentaRef, {
            saldo: cuenta.saldo - gasto.monto,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      await batch.commit();
      await get().cargarGastos();
    } catch (error: any) {
      console.error('Error al agregar gasto:', error);
      set({ error: `Error al agregar gasto: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  cargarGastos: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }

    set({ loading: true, error: null });

    try {
      const gastosSnapshot = await getDocs(
        query(collection(db, 'gastos'), where('userId', '==', user.uid))
      );
      
      const gastos = gastosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Gasto[];

      set({ gastos });
    } catch (error: any) {
      console.error('Error al cargar gastos:', error);
      set({ error: `Error al cargar gastos: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  eliminarGasto: async (id) => {
    set({ loading: true, error: null });
    try {
      await doc(db, 'gastos', id).delete();
      await get().cargarGastos();
    } catch (error: any) {
      console.error('Error al eliminar gasto:', error);
      set({ error: `Error al eliminar gasto: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  registrarPago: async (id, monto, cuenta) => {
    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      
      const gastoRef = doc(db, 'gastos', id);
      const gastoDoc = await gastoRef.get();
      const gasto = gastoDoc.data() as Gasto;
      
      const nuevoMontoPagado = gasto.montoPagado + monto;
      const nuevoEstado = nuevoMontoPagado >= gasto.monto ? 'pagado' : 'parcial';
      
      batch.update(gastoRef, {
        montoPagado: nuevoMontoPagado,
        estadoPago: nuevoEstado,
        updatedAt: serverTimestamp()
      });
      
      const cuentaRef = doc(db, 'categoriasIngreso', cuenta);
      const cuentaDoc = await cuentaRef.get();
      const cuentaData = cuentaDoc.data() as CategoriaIngreso;
      
      if (cuentaData.saldo < monto) {
        throw new Error('Saldo insuficiente en la cuenta');
      }
      
      batch.update(cuentaRef, {
        saldo: cuentaData.saldo - monto,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      await get().cargarGastos();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      set({ error: `Error al registrar pago: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  agregarCategoria: async (categoria) => {
    set({ loading: true, error: null });
    try {
      const categoriaRef = doc(collection(db, 'categorias'));
      await categoriaRef.set({
        ...categoria,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error al agregar categoría:', error);
      set({ error: `Error al agregar categoría: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  eliminarCategoria: async (id) => {
    set({ loading: true, error: null });
    try {
      await doc(db, 'categorias', id).delete();
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      set({ error: `Error al eliminar categoría: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  agregarMedioPago: async (medioPago) => {
    set({ loading: true, error: null });
    try {
      const medioPagoRef = doc(collection(db, 'mediosPago'));
      await medioPagoRef.set({
        ...medioPago,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error al agregar medio de pago:', error);
      set({ error: `Error al agregar medio de pago: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  eliminarMedioPago: async (id) => {
    set({ loading: true, error: null });
    try {
      await doc(db, 'mediosPago', id).delete();
    } catch (error: any) {
      console.error('Error al eliminar medio de pago:', error);
      set({ error: `Error al eliminar medio de pago: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  agregarCategoriaIngreso: async (categoria) => {
    set({ loading: true, error: null });
    try {
      const categoriaRef = doc(collection(db, 'categoriasIngreso'));
      await categoriaRef.set({
        ...categoria,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error al agregar categoría de ingreso:', error);
      set({ error: `Error al agregar categoría de ingreso: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  agregarIngreso: async (ingreso) => {
    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      
      const ingresoRef = doc(collection(db, 'ingresos'));
      batch.set(ingresoRef, {
        ...ingreso,
        createdAt: serverTimestamp()
      });
      
      const cuentaRef = doc(db, 'categoriasIngreso', ingreso.cuenta);
      const cuentaDoc = await cuentaRef.get();
      const cuenta = cuentaDoc.data() as CategoriaIngreso;
      
      batch.update(cuentaRef, {
        saldo: cuenta.saldo + ingreso.monto,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
    } catch (error: any) {
      console.error('Error al agregar ingreso:', error);
      set({ error: `Error al agregar ingreso: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarIngreso: async (id) => {
    set({ loading: true, error: null });
    try {
      await doc(db, 'ingresos', id).delete();
    } catch (error: any) {
      console.error('Error al eliminar ingreso:', error);
      set({ error: `Error al eliminar ingreso: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  transferirEntreCuentas: async (origen, destino, monto) => {
    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      
      const origenRef = doc(db, 'categoriasIngreso', origen);
      const origenDoc = await origenRef.get();
      const origenData = origenDoc.data() as CategoriaIngreso;
      
      if (origenData.saldo < monto) {
        throw new Error('Saldo insuficiente en la cuenta origen');
      }
      
      const destinoRef = doc(db, 'categoriasIngreso', destino);
      const destinoDoc = await destinoRef.get();
      const destinoData = destinoDoc.data() as CategoriaIngreso;
      
      batch.update(origenRef, {
        saldo: origenData.saldo - monto,
        updatedAt: serverTimestamp()
      });
      
      batch.update(destinoRef, {
        saldo: destinoData.saldo + monto,
        updatedAt: serverTimestamp()
      });
      
      const transferenciaRef = doc(collection(db, 'transferencias'));
      batch.set(transferenciaRef, {
        origen,
        destino,
        monto,
        fecha: serverTimestamp()
      });
      
      await batch.commit();
    } catch (error: any) {
      console.error('Error al transferir entre cuentas:', error);
      set({ error: `Error al transferir entre cuentas: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  generarCierreBalance: async () => {
    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      
      const gastosVariables = get().gastos.filter(g => !g.esFijo);
      const ingresos = get().ingresos;
      
      const totalGastosFijos = get().gastos.filter(g => g.esFijo).reduce((sum, g) => sum + g.monto, 0);
      const totalGastosVariables = gastosVariables.reduce((sum, g) => sum + g.monto, 0);
      const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
      
      const balanceRef = doc(collection(db, 'balances'));
      batch.set(balanceRef, {
        fecha: new Date(),
        gastosFijos: totalGastosFijos,
        gastosVariables: totalGastosVariables,
        ingresos: totalIngresos,
        saldoFinal: totalIngresos - (totalGastosFijos + totalGastosVariables)
      });
      
      gastosVariables.forEach(gasto => {
        batch.delete(doc(db, 'gastos', gasto.id));
      });
      
      ingresos.forEach(ingreso => {
        batch.delete(doc(db, 'ingresos', ingreso.id));
      });
      
      await batch.commit();
      await get().cargarGastos();
    } catch (error: any) {
      console.error('Error al generar cierre de balance:', error);
      set({ error: `Error al generar cierre de balance: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  initializeUserData: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }

    set({ loading: true, error: null });

    try {
      const batch = writeBatch(db);

      const defaultCategories = ['Alimentación', 'Transporte', 'Servicios', 'Entretenimiento'];
      for (const category of defaultCategories) {
        const categoryRef = doc(collection(db, 'categorias'));
        batch.set(categoryRef, {
          nombre: category,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }

      const defaultPaymentMethods = [
        { nombre: 'Efectivo', tipo: 'efectivo' },
        { nombre: 'Tarjeta de Débito', tipo: 'debito' },
        { nombre: 'Tarjeta de Crédito', tipo: 'credito' }
      ];

      for (const method of defaultPaymentMethods) {
        const methodRef = doc(collection(db, 'mediosPago'));
        batch.set(methodRef, {
          ...method,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }

      const defaultIncomeCategories = [
        { nombre: 'Cuenta Principal', saldo: 0 },
        { nombre: 'Ahorros', saldo: 0 }
      ];

      for (const category of defaultIncomeCategories) {
        const categoryRef = doc(collection(db, 'categoriasIngreso'));
        batch.set(categoryRef, {
          ...category,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      set({ initialized: true });
    } catch (error: any) {
      console.error('Error al inicializar datos:', error);
      set({ error: `Error al inicializar datos: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));