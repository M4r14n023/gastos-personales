import { create } from 'zustand';
import { Gasto, MedioPago, Categoria, Ingreso, CategoriaIngreso, Balance } from '../types';
import { db, auth } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';

const defaultCategoriasIngreso: Omit<CategoriaIngreso, 'id'>[] = [
  { nombre: 'Sueldo' },
  { nombre: 'Ingreso único' },
  { nombre: 'Otros' }
];

const defaultCategorias: Omit<Categoria, 'id'>[] = [
  { nombre: 'Alimentación' },
  { nombre: 'Transporte' },
  { nombre: 'Servicios' },
  { nombre: 'Entretenimiento' },
  { nombre: 'Salud' },
  { nombre: 'Educación' },
  { nombre: 'Otros' }
];

const defaultMediosPago: Omit<MedioPago, 'id'>[] = [
  { nombre: 'Efectivo', tipo: 'efectivo' },
  { nombre: 'Tarjeta de Débito', tipo: 'debito' },
  { nombre: 'Tarjeta de Crédito', tipo: 'credito' }
];

interface State {
  gastos: Gasto[];
  ingresos: Ingreso[];
  mediosPago: MedioPago[];
  categorias: Categoria[];
  categoriasIngreso: CategoriaIngreso[];
  balances: Balance[];
  initialized: boolean;
  loading: boolean;
  error: string | null;
  cargarGastos: () => Promise<void>;
  initializeUserData: () => Promise<void>;
  agregarGasto: (gasto: Omit<Gasto, 'id'>) => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  agregarIngreso: (ingreso: Omit<Ingreso, 'id'>) => Promise<void>;
  eliminarIngreso: (id: string) => Promise<void>;
  agregarMedioPago: (medioPago: Omit<MedioPago, 'id'>) => Promise<void>;
  eliminarMedioPago: (id: string) => Promise<void>;
  agregarCategoria: (categoria: Omit<Categoria, 'id'>) => Promise<void>;
  eliminarCategoria: (id: string) => Promise<void>;
  agregarCategoriaIngreso: (categoria: Omit<CategoriaIngreso, 'id'>) => Promise<void>;
  eliminarCategoriaIngreso: (id: string) => Promise<void>;
  generarCierreBalance: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useStore = create<State>((set, get) => ({
  gastos: [],
  ingresos: [],
  mediosPago: [],
  categorias: [],
  categoriasIngreso: [],
  balances: [],
  initialized: false,
  loading: false,
  error: null,

  setError: (error) => set({ error }),

  initializeUserData: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const batch = writeBatch(db);
      const categoriasRef = collection(db, 'categorias');
      const mediosPagoRef = collection(db, 'mediosPago');
      const categoriasIngresoRef = collection(db, 'categoriasIngreso');
      
      // Check if user already has data
      const categoriasQuery = query(categoriasRef, where('userId', '==', user.uid));
      const categoriasSnapshot = await getDocs(categoriasQuery);
      
      if (categoriasSnapshot.empty) {
        // Initialize default categories
        const nuevasCategorias: Categoria[] = [];
        for (const categoria of defaultCategorias) {
          const docRef = doc(categoriasRef);
          batch.set(docRef, {
            ...categoria,
            userId: user.uid,
            createdAt: serverTimestamp()
          });
          nuevasCategorias.push({ ...categoria, id: docRef.id });
        }
        
        // Initialize default payment methods
        const nuevosMediosPago: MedioPago[] = [];
        for (const medioPago of defaultMediosPago) {
          const docRef = doc(mediosPagoRef);
          batch.set(docRef, {
            ...medioPago,
            userId: user.uid,
            createdAt: serverTimestamp()
          });
          nuevosMediosPago.push({ ...medioPago, id: docRef.id });
        }

        // Initialize default income categories
        const nuevasCategoriasIngreso: CategoriaIngreso[] = [];
        for (const categoria of defaultCategoriasIngreso) {
          const docRef = doc(categoriasIngresoRef);
          batch.set(docRef, {
            ...categoria,
            userId: user.uid,
            createdAt: serverTimestamp()
          });
          nuevasCategoriasIngreso.push({ ...categoria, id: docRef.id });
        }
        
        await batch.commit();
        
        set({
          categorias: nuevasCategorias,
          mediosPago: nuevosMediosPago,
          categoriasIngreso: nuevasCategoriasIngreso,
          initialized: true
        });
      }
      
      await get().cargarGastos();
    } catch (error: any) {
      console.error('Error al inicializar datos:', error);
      set({ error: `Error al inicializar datos: ${error.message || 'Error desconocido'}` });
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
      const categoriasRef = collection(db, 'categorias');
      const mediosPagoRef = collection(db, 'mediosPago');
      const gastosRef = collection(db, 'gastos');
      const ingresosRef = collection(db, 'ingresos');
      const categoriasIngresoRef = collection(db, 'categoriasIngreso');
      const balancesRef = collection(db, 'balances');

      // Set up real-time listeners
      const unsubscribeCategorias = onSnapshot(
        query(categoriasRef, where('userId', '==', user.uid)),
        (snapshot) => {
          const categorias = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Categoria[];
          set({ categorias });
        },
        (error) => {
          console.error('Error al cargar categorías:', error);
          set({ error: `Error al cargar categorías: ${error.message}` });
        }
      );

      const unsubscribeMediosPago = onSnapshot(
        query(mediosPagoRef, where('userId', '==', user.uid)),
        (snapshot) => {
          const mediosPago = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as MedioPago[];
          set({ mediosPago });
        },
        (error) => {
          console.error('Error al cargar medios de pago:', error);
          set({ error: `Error al cargar medios de pago: ${error.message}` });
        }
      );

      const unsubscribeGastos = onSnapshot(
        query(gastosRef, where('userId', '==', user.uid)),
        (snapshot) => {
          const gastos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fecha: data.fecha?.toDate() || new Date(),
            };
          }) as Gasto[];
          set({ gastos });
        },
        (error) => {
          console.error('Error al cargar gastos:', error);
          set({ error: `Error al cargar gastos: ${error.message}` });
        }
      );

      const unsubscribeIngresos = onSnapshot(
        query(ingresosRef, where('userId', '==', user.uid)),
        (snapshot) => {
          const ingresos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fecha: data.fecha?.toDate() || new Date(),
            };
          }) as Ingreso[];
          set({ ingresos });
        },
        (error) => {
          console.error('Error al cargar ingresos:', error);
          set({ error: `Error al cargar ingresos: ${error.message}` });
        }
      );

      const unsubscribeCategoriasIngreso = onSnapshot(
        query(categoriasIngresoRef, where('userId', '==', user.uid)),
        (snapshot) => {
          const categoriasIngreso = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CategoriaIngreso[];
          set({ categoriasIngreso });
        },
        (error) => {
          console.error('Error al cargar categorías de ingreso:', error);
          set({ error: `Error al cargar categorías de ingreso: ${error.message}` });
        }
      );

      const unsubscribeBalances = onSnapshot(
        query(balancesRef, where('userId', '==', user.uid)),
        (snapshot) => {
          const balances = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fecha: data.fecha?.toDate() || new Date(),
            };
          }) as Balance[];
          set({ balances });
        },
        (error) => {
          console.error('Error al cargar balances:', error);
          set({ error: `Error al cargar balances: ${error.message}` });
        }
      );

      // Clean up listeners on auth state change
      auth.onAuthStateChanged((user) => {
        if (!user) {
          unsubscribeCategorias();
          unsubscribeMediosPago();
          unsubscribeGastos();
          unsubscribeIngresos();
          unsubscribeCategoriasIngreso();
          unsubscribeBalances();
          set({
            gastos: [],
            ingresos: [],
            mediosPago: [],
            categorias: [],
            categoriasIngreso: [],
            balances: [],
            initialized: false
          });
        }
      });

      set({ initialized: true });
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      set({ error: `Error al cargar datos: ${error.message || 'Error desconocido'}` });
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
      await addDoc(collection(db, 'gastos'), {
        ...gasto,
        userId: user.uid,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error al agregar gasto:', error);
      set({ error: `Error al agregar gasto: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarGasto: async (id) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      await deleteDoc(doc(db, 'gastos', id));
    } catch (error: any) {
      console.error('Error al eliminar gasto:', error);
      set({ error: `Error al eliminar gasto: ${error.message || 'Error desconocido'}` });
      throw error;
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
      await addDoc(collection(db, 'ingresos'), {
        ...ingreso,
        userId: user.uid,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error al agregar ingreso:', error);
      set({ error: `Error al agregar ingreso: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarIngreso: async (id) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      await deleteDoc(doc(db, 'ingresos', id));
    } catch (error: any) {
      console.error('Error al eliminar ingreso:', error);
      set({ error: `Error al eliminar ingreso: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  agregarMedioPago: async (medioPago) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      await addDoc(collection(db, 'mediosPago'), {
        ...medioPago,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error al agregar medio de pago:', error);
      set({ error: `Error al agregar medio de pago: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarMedioPago: async (id) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      await deleteDoc(doc(db, 'mediosPago', id));
    } catch (error: any) {
      console.error('Error al eliminar medio de pago:', error);
      set({ error: `Error al eliminar medio de pago: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  agregarCategoria: async (categoria) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      await addDoc(collection(db, 'categorias'), {
        ...categoria,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error al agregar categoría:', error);
      set({ error: `Error al agregar categoría: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarCategoria: async (id) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      await deleteDoc(doc(db, 'categorias', id));
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      set({ error: `Error al eliminar categoría: ${error.message || 'Error desconocido'}` });
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
    } catch (error: any) {
      console.error('Error al agregar categoría de ingreso:', error);
      set({ error: `Error al agregar categoría de ingreso: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarCategoriaIngreso: async (id) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Usuario no autenticado' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      await deleteDoc(doc(db, 'categoriasIngreso', id));
    } catch (error: any) {
      console.error('Error al eliminar categoría de ingreso:', error);
      set({ error: `Error al eliminar categoría de ingreso: ${error.message || 'Error desconocido'}` });
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
      const { gastos, ingresos } = get();
      
      const gastosFijos = gastos.filter(g => g.esFijo).reduce((sum, g) => sum + g.monto, 0);
      const gastosVariables = gastos.filter(g => !g.esFijo).reduce((sum, g) => sum + g.monto, 0);
      const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
      const saldoFinal = totalIngresos - (gastosFijos + gastosVariables);

      // Crear nuevo balance
      await addDoc(collection(db, 'balances'), {
        userId: user.uid,
        fecha: serverTimestamp(),
        gastosFijos,
        gastosVariables,
        ingresos: totalIngresos,
        saldoFinal,
        createdAt: serverTimestamp()
      });

      // Limpiar gastos e ingresos
      const batch = writeBatch(db);
      
      for (const gasto of gastos) {
        if (!gasto.esFijo) { // Mantener gastos fijos
          batch.delete(doc(db, 'gastos', gasto.id));
        }
      }
      
      for (const ingreso of ingresos) {
        batch.delete(doc(db, 'ingresos', ingreso.id));
      }
      
      await batch.commit();
      
    } catch (error: any) {
      console.error('Error al generar cierre de balance:', error);
      set({ error: `Error al generar cierre de balance: ${error.message || 'Error desconocido'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));