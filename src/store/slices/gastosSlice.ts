import { StateCreator } from 'zustand';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Gasto } from '../../types';

export interface GastosSlice {
  gastos: Gasto[];
  cargarGastos: () => Promise<void>;
  agregarGasto: (gasto: Omit<Gasto, 'id' | 'userId'>) => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  eliminarTodosLosGastos: () => Promise<void>;
  registrarPago: (id: string, monto: number, cuenta: string) => Promise<void>;
}

export const createGastosSlice: StateCreator<GastosSlice> = (set, get) => ({
  gastos: [],
  
  cargarGastos: async () => {
    const user = auth.currentUser;
    if (!user) return;

    const gastosSnapshot = await getDocs(
      query(collection(db, 'gastos'), where('userId', '==', user.uid))
    );
    
    const gastos = gastosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Gasto[];

    set({ gastos });
  },

  agregarGasto: async (gasto) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const gastoDoc = await addDoc(collection(db, 'gastos'), {
      ...gasto,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // If it's not a fixed expense and has an account, update the account balance
    if (!gasto.esFijo && gasto.cuenta) {
      const cuentaRef = doc(db, 'categoriasIngreso', gasto.cuenta);
      await updateDoc(cuentaRef, {
        saldo: get().categoriasIngreso.find(c => c.id === gasto.cuenta)!.saldo - gasto.monto,
        updatedAt: serverTimestamp()
      });
    }

    await get().cargarGastos();
  },

  eliminarGasto: async (id) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Get the expense first to check if we need to update account balance
    const gasto = get().gastos.find(g => g.id === id);
    if (!gasto) throw new Error('Gasto no encontrado');

    // If it's not a fixed expense and has an account, restore the account balance
    if (!gasto.esFijo && gasto.cuenta) {
      const cuentaRef = doc(db, 'categoriasIngreso', gasto.cuenta);
      await updateDoc(cuentaRef, {
        saldo: get().categoriasIngreso.find(c => c.id === gasto.cuenta)!.saldo + gasto.montoPagado,
        updatedAt: serverTimestamp()
      });
    }

    // Delete the expense
    await deleteDoc(doc(db, 'gastos', id));

    // Reload data
    await get().cargarGastos();
  },

  eliminarTodosLosGastos: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const batch = writeBatch(db);
    const { gastos, categoriasIngreso } = get();

    // First, restore all account balances for non-fixed expenses
    const balanceUpdates = new Map<string, number>();
    gastos.forEach(gasto => {
      if (!gasto.esFijo && gasto.cuenta && gasto.montoPagado > 0) {
        const currentBalance = balanceUpdates.get(gasto.cuenta) || 0;
        balanceUpdates.set(gasto.cuenta, currentBalance + gasto.montoPagado);
      }
    });

    // Update account balances
    for (const [cuentaId, montoRestaurar] of balanceUpdates.entries()) {
      const cuenta = categoriasIngreso.find(c => c.id === cuentaId);
      if (cuenta) {
        const cuentaRef = doc(db, 'categoriasIngreso', cuentaId);
        batch.update(cuentaRef, {
          saldo: cuenta.saldo + montoRestaurar,
          updatedAt: serverTimestamp()
        });
      }
    }

    // Delete all expenses
    const gastosSnapshot = await getDocs(
      query(collection(db, 'gastos'), where('userId', '==', user.uid))
    );
    
    gastosSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Commit all changes
    await batch.commit();

    // Reload data
    await get().cargarGastos();
  },

  registrarPago: async (id, monto, cuenta) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const gasto = get().gastos.find(g => g.id === id);
    if (!gasto) throw new Error('Gasto no encontrado');

    const montoRestante = gasto.monto - gasto.montoPagado;
    if (monto > montoRestante) throw new Error('El monto excede el saldo pendiente');

    // Update account balance
    const cuentaRef = doc(db, 'categoriasIngreso', cuenta);
    await updateDoc(cuentaRef, {
      saldo: get().categoriasIngreso.find(c => c.id === cuenta)!.saldo - monto,
      updatedAt: serverTimestamp()
    });

    // Update expense
    await updateDoc(doc(db, 'gastos', id), {
      montoPagado: gasto.montoPagado + monto,
      estadoPago: gasto.montoPagado + monto >= gasto.monto ? 'pagado' : 'parcial',
      updatedAt: serverTimestamp()
    });

    // Reload data
    await get().cargarGastos();
  }
});