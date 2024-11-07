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
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc 
} from 'firebase/firestore';
import { CategoriaIngreso, Gasto, Ingreso } from '../types';

interface State {
  gastos: Gasto[];
  categoriasIngreso: CategoriaIngreso[];
  ingresos: Ingreso[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  agregarGasto: (gasto: Omit<Gasto, 'id'>) => Promise<void>;
  cargarGastos: () => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  registrarPago: (id: string, monto: number, cuenta: string) => Promise<void>;
  agregarCategoriaIngreso: (categoria: { nombre: string; saldo: number }) => Promise<void>;
  editarCategoriaIngreso: (id: string, nuevoNombre: string) => Promise<void>;
  agregarIngreso: (ingreso: Omit<Ingreso, 'id'>) => Promise<void>;
  eliminarIngreso: (id: string) => Promise<void>;
  transferirEntreCuentas: (origen: string, destino: string, monto: number) => Promise<void>;
  generarCierreBalance: () => Promise<void>;
  initializeUserData: () => Promise<void>;
  cargarCategoriasIngreso: () => Promise<void>;
  cargarIngresos: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  gastos: [],
  categoriasIngreso: [],
  ingresos: [],
  loading: false,
  error: null,
  initialized: false,

  cargarCategoriasIngreso: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const categoriasSnapshot = await getDocs(
        query(collection(db, 'categoriasIngreso'), where('userId', '==', user.uid))
      );
      
      const categorias = categoriasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoriaIngreso[];

      set({ categoriasIngreso: categorias });
    } catch (error) {
      console.error('Error loading income categories:', error);
    }
  },

  cargarIngresos: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const ingresosSnapshot = await getDocs(
        query(collection(db, 'ingresos'), where('userId', '==', user.uid))
      );
      
      const ingresos = ingresosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ingreso[];

      set({ ingresos });
    } catch (error) {
      console.error('Error loading incomes:', error);
    }
  },

  editarCategoriaIngreso: async (id: string, nuevoNombre: string) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const cuentaRef = doc(db, 'categoriasIngreso', id);
      await updateDoc(cuentaRef, {
        nombre: nuevoNombre,
        updatedAt: serverTimestamp()
      });
      await get().cargarCategoriasIngreso();
    } catch (error: any) {
      console.error('Error al editar categoría de ingreso:', error);
      set({ error: `Error al editar categoría de ingreso: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  agregarGasto: async (gasto) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const batch = writeBatch(db);
      
      // Create the expense document
      const gastoRef = doc(collection(db, 'gastos'));
      batch.set(gastoRef, {
        ...gasto,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      // If it's a variable expense, update the account balance
      if (!gasto.esFijo && gasto.cuenta) {
        const cuentaRef = doc(db, 'categoriasIngreso', gasto.cuenta);
        const cuentaDoc = await getDoc(cuentaRef);
        
        if (cuentaDoc.exists()) {
          const cuenta = cuentaDoc.data() as CategoriaIngreso;
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
      await get().cargarCategoriasIngreso();
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
      await deleteDoc(doc(db, 'gastos', id));
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
      
      // Update expense
      const gastoRef = doc(db, 'gastos', id);
      const gastoDoc = await getDoc(gastoRef);
      if (!gastoDoc.exists()) {
        throw new Error('Gasto no encontrado');
      }
      const gasto = gastoDoc.data() as Gasto;
      
      const nuevoMontoPagado = gasto.montoPagado + monto;
      const nuevoEstado = nuevoMontoPagado >= gasto.monto ? 'pagado' : 'parcial';
      
      batch.update(gastoRef, {
        montoPagado: nuevoMontoPagado,
        estadoPago: nuevoEstado,
        updatedAt: serverTimestamp()
      });
      
      // Update account balance
      const cuentaRef = doc(db, 'categoriasIngreso', cuenta);
      const cuentaDoc = await getDoc(cuentaRef);
      if (!cuentaDoc.exists()) {
        throw new Error('Cuenta no encontrada');
      }
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
      await get().cargarCategoriasIngreso();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      set({ error: `Error al registrar pago: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  agregarCategoriaIngreso: async (categoria) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }

    set({ loading: true, error: null });
    try {
      await addDoc(collection(db, 'categoriasIngreso'), {
        ...categoria,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      await get().cargarCategoriasIngreso();
    } catch (error: any) {
      console.error('Error al agregar categoría de ingreso:', error);
      set({ error: `Error al agregar categoría de ingreso: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  agregarIngreso: async (ingreso) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      
      // Create income document
      const ingresoRef = doc(collection(db, 'ingresos'));
      batch.set(ingresoRef, {
        ...ingreso,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      
      // Update account balance
      const cuentaRef = doc(db, 'categoriasIngreso', ingreso.cuenta);
      const cuentaDoc = await getDoc(cuentaRef);
      if (!cuentaDoc.exists()) {
        throw new Error('Cuenta no encontrada');
      }
      const cuenta = cuentaDoc.data() as CategoriaIngreso;
      
      batch.update(cuentaRef, {
        saldo: cuenta.saldo + ingreso.monto,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      await get().cargarCategoriasIngreso();
      await get().cargarIngresos();
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
      await deleteDoc(doc(db, 'ingresos', id));
      await get().cargarIngresos();
    } catch (error: any) {
      console.error('Error al eliminar ingreso:', error);
      set({ error: `Error al eliminar ingreso: ${error.message || 'Error desconocido'}` });
    } finally {
      set({ loading: false });
    }
  },

  transferirEntreCuentas: async (origen, destino, monto) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      
      // Get source account
      const origenRef = doc(db, 'categoriasIngreso', origen);
      const origenDoc = await getDoc(origenRef);
      if (!origenDoc.exists()) {
        throw new Error('Cuenta origen no encontrada');
      }
      const origenData = origenDoc.data() as CategoriaIngreso;
      
      if (origenData.saldo < monto) {
        throw new Error('Saldo insuficiente en la cuenta origen');
      }
      
      // Get destination account
      const destinoRef = doc(db, 'categoriasIngreso', destino);
      const destinoDoc = await getDoc(destinoRef);
      if (!destinoDoc.exists()) {
        throw new Error('Cuenta destino no encontrada');
      }
      const destinoData = destinoDoc.data() as CategoriaIngreso;
      
      // Update balances
      batch.update(origenRef, {
        saldo: origenData.saldo - monto,
        updatedAt: serverTimestamp()
      });
      
      batch.update(destinoRef, {
        saldo: destinoData.saldo + monto,
        updatedAt: serverTimestamp()
      });
      
      // Create transfer record
      const transferenciaRef = doc(collection(db, 'transferencias'));
      batch.set(transferenciaRef, {
        origen,
        destino,
        monto,
        userId: user.uid,
        fecha: serverTimestamp()
      });
      
      await batch.commit();
      await get().cargarCategoriasIngreso();
    } catch (error: any) {
      console.error('Error al transferir entre cuentas:', error);
      set({ error: `Error al transferir entre cuentas: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  generarCierreBalance: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      
      const gastosVariables = get().gastos.filter(g => !g.esFijo);
      const ingresos = get().ingresos;
      
      const totalGastosFijos = get().gastos.filter(g => g.esFijo).reduce((sum, g) => sum + g.monto, 0);
      const totalGastosVariables = gastosVariables.reduce((sum, g) => sum + g.monto, 0);
      const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
      
      // Create balance record
      const balanceRef = doc(collection(db, 'balances'));
      batch.set(balanceRef, {
        fecha: new Date(),
        gastosFijos: totalGastosFijos,
        gastosVariables: totalGastosVariables,
        ingresos: totalIngresos,
        saldoFinal: totalIngresos - (totalGastosFijos + totalGastosVariables),
        userId: user.uid
      });
      
      // Delete variable expenses and incomes
      gastosVariables.forEach(gasto => {
        batch.delete(doc(db, 'gastos', gasto.id));
      });
      
      ingresos.forEach(ingreso => {
        batch.delete(doc(db, 'ingresos', ingreso.id));
      });
      
      await batch.commit();
      await get().cargarGastos();
      await get().cargarIngresos();
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
      const categoriasSnapshot = await getDocs(
        query(collection(db, 'categoriasIngreso'), where('userId', '==', user.uid))
      );

      if (categoriasSnapshot.empty) {
        const batch = writeBatch(db);

        // Initialize default income categories
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
      }

      await get().cargarCategoriasIngreso();
      await get().cargarIngresos();
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