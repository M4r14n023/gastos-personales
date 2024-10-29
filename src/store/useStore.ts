import { create } from 'zustand';
import { Gasto, MedioPago, Categoria } from '../types';
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

const defaultCategorias: Omit<Categoria, 'id'>[] = [
  { nombre: 'Carnicería' },
  { nombre: 'Verdulería' },
  { nombre: 'Granja' },
  { nombre: 'Huevos' },
  { nombre: 'Nafta' },
  { nombre: 'Resumen Visa Galicia' },
  { nombre: 'Resumen Carrefour' },
  { nombre: 'Gym' },
  { nombre: 'Tenis Telefonos' }
];

const defaultMediosPago: Omit<MedioPago, 'id'>[] = [
  { nombre: 'Efectivo', tipo: 'efectivo' },
  { nombre: 'Débito Visa', tipo: 'debito' },
  { nombre: 'Crédito Visa', tipo: 'credito' }
];

interface State {
  gastos: Gasto[];
  mediosPago: MedioPago[];
  categorias: Categoria[];
  initialized: boolean;
  loading: boolean;
  error: string | null;
  cargarGastos: () => Promise<void>;
  initializeUserData: () => Promise<void>;
  agregarGasto: (gasto: Omit<Gasto, 'id'>) => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  agregarMedioPago: (medioPago: Omit<MedioPago, 'id'>) => Promise<void>;
  eliminarMedioPago: (id: string) => Promise<void>;
  agregarCategoria: (categoria: Omit<Categoria, 'id'>) => Promise<void>;
  eliminarCategoria: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useStore = create<State>((set, get) => ({
  gastos: [],
  mediosPago: [],
  categorias: [],
  initialized: false,
  loading: false,
  error: null,

  setError: (error) => set({ error }),

  initializeUserData: async () => {
    if (!auth.currentUser) return;
    
    set({ loading: true, error: null });
    
    try {
      const batch = writeBatch(db);
      const categoriasRef = collection(db, 'categorias');
      const mediosPagoRef = collection(db, 'mediosPago');
      
      // Check if user already has data
      const categoriasQuery = query(categoriasRef, where('userId', '==', auth.currentUser.uid));
      const categoriasSnapshot = await getDocs(categoriasQuery);
      
      if (categoriasSnapshot.empty) {
        // Initialize default categories
        const nuevasCategorias: Categoria[] = [];
        for (const categoria of defaultCategorias) {
          const docRef = doc(categoriasRef);
          batch.set(docRef, {
            ...categoria,
            userId: auth.currentUser.uid,
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
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp()
          });
          nuevosMediosPago.push({ ...medioPago, id: docRef.id });
        }
        
        await batch.commit();
        
        set({
          categorias: nuevasCategorias,
          mediosPago: nuevosMediosPago,
          initialized: true
        });
      }
      
      await get().cargarGastos();
    } catch (error) {
      console.error('Error al inicializar datos:', error);
      set({ error: 'Error al inicializar datos' });
    } finally {
      set({ loading: false });
    }
  },

  cargarGastos: async () => {
    if (!auth.currentUser) return;
    
    set({ loading: true, error: null });
    
    try {
      const categoriasRef = collection(db, 'categorias');
      const mediosPagoRef = collection(db, 'mediosPago');
      const gastosRef = collection(db, 'gastos');

      // Set up real-time listeners
      const unsubscribeCategorias = onSnapshot(
        query(categoriasRef, where('userId', '==', auth.currentUser.uid)),
        (snapshot) => {
          const categorias = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Categoria[];
          set({ categorias });
        },
        (error) => {
          console.error('Error al escuchar categorías:', error);
          set({ error: 'Error al cargar categorías' });
        }
      );

      const unsubscribeMediosPago = onSnapshot(
        query(mediosPagoRef, where('userId', '==', auth.currentUser.uid)),
        (snapshot) => {
          const mediosPago = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as MedioPago[];
          set({ mediosPago });
        },
        (error) => {
          console.error('Error al escuchar medios de pago:', error);
          set({ error: 'Error al cargar medios de pago' });
        }
      );

      const unsubscribeGastos = onSnapshot(
        query(gastosRef, where('userId', '==', auth.currentUser.uid)),
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
          console.error('Error al escuchar gastos:', error);
          set({ error: 'Error al cargar gastos' });
        }
      );

      // Clean up listeners on auth state change
      auth.onAuthStateChanged((user) => {
        if (!user) {
          unsubscribeCategorias();
          unsubscribeMediosPago();
          unsubscribeGastos();
        }
      });

      set({ initialized: true });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      set({ error: 'Error al cargar datos' });
    } finally {
      set({ loading: false });
    }
  },

  agregarGasto: async (gasto) => {
    if (!auth.currentUser) return;
    
    set({ loading: true, error: null });
    
    try {
      await addDoc(collection(db, 'gastos'), {
        ...gasto,
        userId: auth.currentUser.uid,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al agregar gasto:', error);
      set({ error: 'Error al agregar gasto' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarGasto: async (id) => {
    if (!auth.currentUser) return;
    
    set({ loading: true, error: null });
    
    try {
      await deleteDoc(doc(db, 'gastos', id));
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      set({ error: 'Error al eliminar gasto' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  agregarMedioPago: async (medioPago) => {
    if (!auth.currentUser) return;
    
    set({ loading: true, error: null });
    
    try {
      await addDoc(collection(db, 'mediosPago'), {
        ...medioPago,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al agregar medio de pago:', error);
      set({ error: 'Error al agregar medio de pago' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarMedioPago: async (id) => {
    if (!auth.currentUser) return;
    
    set({ loading: true, error: null });
    
    try {
      await deleteDoc(doc(db, 'mediosPago', id));
    } catch (error) {
      console.error('Error al eliminar medio de pago:', error);
      set({ error: 'Error al eliminar medio de pago' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  agregarCategoria: async (categoria) => {
    if (!auth.currentUser) return;
    
    set({ loading: true, error: null });
    
    try {
      await addDoc(collection(db, 'categorias'), {
        ...categoria,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      set({ error: 'Error al agregar categoría' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  eliminarCategoria: async (id) => {
    if (!auth.currentUser) return;
    
    set({ loading: true, error: null });
    
    try {
      await deleteDoc(doc(db, 'categorias', id));
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      set({ error: 'Error al eliminar categoría' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));