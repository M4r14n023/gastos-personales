import { StateCreator } from 'zustand';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Ingreso, CategoriaIngreso } from '../../types';

export interface IngresosSlice {
  ingresos: Ingreso[];
  categoriasIngreso: CategoriaIngreso[];
  cargarIngresos: () => Promise<void>;
  cargarCategoriasIngreso: () => Promise<void>;
  agregarIngreso: (ingreso: Omit<Ingreso, 'id' | 'userId'>) => Promise<void>;
  agregarCategoriaIngreso: (categoria: Omit<CategoriaIngreso, 'id' | 'userId'>) => Promise<void>;
  editarCategoriaIngreso: (id: string, nuevoNombre: string) => Promise<void>;
  eliminarIngreso: (id: string) => Promise<void>;
  transferirEntreCuentas: (origen: string, destino: string, monto: number) => Promise<void>;
}

export const createIngresosSlice: StateCreator<IngresosSlice> = (set, get) => ({
  ingresos: [],
  categoriasIngreso: [],
  
  cargarIngresos: async () => {
    const user = auth.currentUser;
    if (!user) return;

    const ingresosSnapshot = await getDocs(
      query(
        collection(db, 'ingresos'), 
        where('userId', '==', user.uid),
        where('procesado', '==', false)
      )
    );
    
    const ingresos = ingresosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Ingreso[];

    set({ ingresos });
  },

  cargarCategoriasIngreso: async () => {
    const user = auth.currentUser;
    if (!user) return;

    const categoriasSnapshot = await getDocs(
      query(collection(db, 'categoriasIngreso'), where('userId', '==', user.uid))
    );
    
    const categorias = categoriasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CategoriaIngreso[];

    set({ categoriasIngreso: categorias });
  },

  agregarIngreso: async (ingreso) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Add the income record
    const ingresoDoc = await addDoc(collection(db, 'ingresos'), {
      ...ingreso,
      userId: user.uid,
      procesado: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update the account balance
    const cuentaRef = doc(db, 'categoriasIngreso', ingreso.cuenta);
    await updateDoc(cuentaRef, {
      saldo: get().categoriasIngreso.find(c => c.id === ingreso.cuenta)!.saldo + ingreso.monto,
      updatedAt: serverTimestamp()
    });

    // Reload data
    await Promise.all([
      get().cargarIngresos(),
      get().cargarCategoriasIngreso()
    ]);
  },

  agregarCategoriaIngreso: async (categoria) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    await addDoc(collection(db, 'categoriasIngreso'), {
      ...categoria,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await get().cargarCategoriasIngreso();
  },

  editarCategoriaIngreso: async (id, nuevoNombre) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const categoriaRef = doc(db, 'categoriasIngreso', id);
    await updateDoc(categoriaRef, {
      nombre: nuevoNombre,
      updatedAt: serverTimestamp()
    });

    await get().cargarCategoriasIngreso();
  },

  eliminarIngreso: async (id) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Get the income record first to know the amount and account
    const ingreso = get().ingresos.find(i => i.id === id);
    if (!ingreso) throw new Error('Ingreso no encontrado');

    // Update the account balance
    const cuentaRef = doc(db, 'categoriasIngreso', ingreso.cuenta);
    await updateDoc(cuentaRef, {
      saldo: get().categoriasIngreso.find(c => c.id === ingreso.cuenta)!.saldo - ingreso.monto,
      updatedAt: serverTimestamp()
    });

    // Delete the income record
    await deleteDoc(doc(db, 'ingresos', id));

    // Reload data
    await Promise.all([
      get().cargarIngresos(),
      get().cargarCategoriasIngreso()
    ]);
  },

  transferirEntreCuentas: async (origen, destino, monto) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const cuentaOrigen = get().categoriasIngreso.find(c => c.id === origen);
    if (!cuentaOrigen) throw new Error('Cuenta origen no encontrada');
    if (cuentaOrigen.saldo < monto) throw new Error('Saldo insuficiente');

    // Update origin account
    await updateDoc(doc(db, 'categoriasIngreso', origen), {
      saldo: cuentaOrigen.saldo - monto,
      updatedAt: serverTimestamp()
    });

    // Update destination account
    const cuentaDestino = get().categoriasIngreso.find(c => c.id === destino);
    if (!cuentaDestino) throw new Error('Cuenta destino no encontrada');

    await updateDoc(doc(db, 'categoriasIngreso', destino), {
      saldo: cuentaDestino.saldo + monto,
      updatedAt: serverTimestamp()
    });

    // Record the transfer
    await addDoc(collection(db, 'transferencias'), {
      origen,
      destino,
      monto,
      userId: user.uid,
      createdAt: serverTimestamp()
    });

    await get().cargarCategoriasIngreso();
  }
});