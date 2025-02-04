import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { 
  collection, 
  doc, 
  writeBatch, 
  serverTimestamp, 
  getDocs, 
  query, 
  where,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { createDolaresSlice, DolaresSlice } from './slices/dolaresSlice';
import { createGastosSlice, GastosSlice } from './slices/gastosSlice';
import { createIngresosSlice, IngresosSlice } from './slices/ingresosSlice';
import { createCreditosSlice, CreditosSlice } from './slices/creditosSlice';

interface State extends DolaresSlice, GastosSlice, IngresosSlice, CreditosSlice {
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initializeUserData: () => Promise<void>;
  generarCierreBalance: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  ...createDolaresSlice(set, get),
  ...createGastosSlice(set, get),
  ...createIngresosSlice(set, get),
  ...createCreditosSlice(set, get),
  loading: false,
  error: null,
  initialized: false,

  initializeUserData: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }

    set({ loading: true, error: null });

    try {
      // Initialize user document
      const userRef = doc(db, 'usuarios', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          saldoDolares: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Initialize default categories if none exist
      const categoriasSnapshot = await getDocs(
        query(collection(db, 'categoriasIngreso'), where('userId', '==', user.uid))
      );

      if (categoriasSnapshot.empty) {
        const batch = writeBatch(db);
        const defaultCategories = [
          { nombre: 'Cuenta Principal', saldo: 0 },
          { nombre: 'Ahorros', saldo: 0 }
        ];

        for (const category of defaultCategories) {
          const categoryRef = doc(collection(db, 'categoriasIngreso'));
          batch.set(categoryRef, {
            ...category,
            userId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        await batch.commit();
      }

      // Load all data
      await Promise.all([
        get().cargarCategoriasIngreso(),
        get().cargarIngresos(),
        get().cargarCreditos(),
        get().cargarGastos(),
        get().cargarMovimientosDolares()
      ]);

      set({ initialized: true, error: null });
    } catch (error: any) {
      console.error('Error al inicializar datos:', error);
      set({ 
        error: `Error al inicializar datos: ${error.message || 'Error desconocido'}`,
        initialized: false 
      });
    } finally {
      set({ loading: false });
    }
  },

  generarCierreBalance: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    set({ loading: true, error: null });

    try {
      const batch = writeBatch(db);

      // 1. Crear registro de cierre
      const cierreRef = doc(collection(db, 'cierresBalance'));
      const fecha = new Date();
      const { ingresos, gastos, categoriasIngreso } = get();

      const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
      const totalGastosFijos = gastos.filter(g => g.esFijo).reduce((sum, g) => sum + g.monto, 0);
      const totalGastosVariables = gastos.filter(g => !g.esFijo).reduce((sum, g) => sum + g.monto, 0);
      const saldoTotal = categoriasIngreso.reduce((sum, c) => sum + c.saldo, 0);

      batch.set(cierreRef, {
        fecha,
        totalIngresos,
        totalGastosFijos,
        totalGastosVariables,
        saldoTotal,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      // 2. Marcar ingresos como procesados
      const ingresosQuery = query(collection(db, 'ingresos'), where('userId', '==', user.uid));
      const ingresosSnapshot = await getDocs(ingresosQuery);
      ingresosSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { procesado: true, updatedAt: serverTimestamp() });
      });

      // 3. Marcar gastos variables como procesados
      const gastosQuery = query(collection(db, 'gastos'), where('userId', '==', user.uid));
      const gastosSnapshot = await getDocs(gastosQuery);
      gastosSnapshot.docs.forEach(doc => {
        const gasto = doc.data();
        if (!gasto.esFijo) {
          batch.update(doc.ref, { procesado: true, updatedAt: serverTimestamp() });
        }
      });

      await batch.commit();

      // 4. Recargar datos
      await Promise.all([
        get().cargarIngresos(),
        get().cargarGastos(),
        get().cargarCategoriasIngreso()
      ]);

      set({ error: null });
    } catch (error: any) {
      console.error('Error al generar cierre de balance:', error);
      set({ error: `Error al generar cierre de balance: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));