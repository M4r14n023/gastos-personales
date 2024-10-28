import { create } from 'zustand';
import { Gasto, MedioPago, Categoria } from '../types';
import { db, auth } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

interface State {
  gastos: Gasto[];
  mediosPago: MedioPago[];
  categorias: Categoria[];
  cargarGastos: () => Promise<void>;
  agregarGasto: (gasto: Omit<Gasto, 'id'>) => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  agregarMedioPago: (medioPago: Omit<MedioPago, 'id'>) => Promise<void>;
  eliminarMedioPago: (id: string) => Promise<void>;
  agregarCategoria: (categoria: Omit<Categoria, 'id'>) => Promise<void>;
  eliminarCategoria: (id: string) => Promise<void>;
}

export const useStore = create<State>((set) => ({
  gastos: [],
  mediosPago: [
    { id: '1', nombre: 'Efectivo', tipo: 'efectivo' },
    { id: '2', nombre: 'Débito', tipo: 'debito' },
    { id: '3', nombre: 'Crédito', tipo: 'credito' },
  ],
  categorias: [
    { id: '1', nombre: 'Alquiler' },
    { id: '2', nombre: 'Servicios' },
    { id: '3', nombre: 'Alimentación' },
  ],

  cargarGastos: async () => {
    if (!auth.currentUser) return;
    
    const gastosRef = collection(db, 'gastos');
    const q = query(gastosRef, where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    const gastos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Gasto[];
    
    set({ gastos });
  },

  agregarGasto: async (gasto) => {
    if (!auth.currentUser) return;
    
    const gastoRef = await addDoc(collection(db, 'gastos'), {
      ...gasto,
      userId: auth.currentUser.uid,
    });
    
    set((state) => ({
      gastos: [...state.gastos, { ...gasto, id: gastoRef.id }],
    }));
  },

  eliminarGasto: async (id) => {
    if (!auth.currentUser) return;
    
    await deleteDoc(doc(db, 'gastos', id));
    
    set((state) => ({
      gastos: state.gastos.filter((gasto) => gasto.id !== id),
    }));
  },

  agregarMedioPago: async (medioPago) => {
    if (!auth.currentUser) return;
    
    const medioPagoRef = await addDoc(collection(db, 'mediosPago'), {
      ...medioPago,
      userId: auth.currentUser.uid,
    });
    
    set((state) => ({
      mediosPago: [...state.mediosPago, { ...medioPago, id: medioPagoRef.id }],
    }));
  },

  eliminarMedioPago: async (id) => {
    if (!auth.currentUser) return;
    
    await deleteDoc(doc(db, 'mediosPago', id));
    
    set((state) => ({
      mediosPago: state.mediosPago.filter((medio) => medio.id !== id),
    }));
  },

  agregarCategoria: async (categoria) => {
    if (!auth.currentUser) return;
    
    const categoriaRef = await addDoc(collection(db, 'categorias'), {
      ...categoria,
      userId: auth.currentUser.uid,
    });
    
    set((state) => ({
      categorias: [...state.categorias, { ...categoria, id: categoriaRef.id }],
    }));
  },

  eliminarCategoria: async (id) => {
    if (!auth.currentUser) return;
    
    await deleteDoc(doc(db, 'categorias', id));
    
    set((state) => ({
      categorias: state.categorias.filter((cat) => cat.id !== id),
    }));
  },
}));