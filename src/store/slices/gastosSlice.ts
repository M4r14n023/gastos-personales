import { StateCreator } from 'zustand';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
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

    try {
      const gastosSnapshot = await getDocs(
        query(collection(db, 'gastos'), where('userId', '==', user.uid))
      );
      
      const gastos = gastosSnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure proper date conversion
        const fecha = data.fecha ? new Date(data.fecha.seconds * 1000) : new Date();
        
        return {
          id: doc.id,
          ...data,
          fecha,
          monto: Number(data.monto),
          montoPagado: Number(data.montoPagado || 0)
        };
      }) as Gasto[];

      set({ gastos });
    } catch (error) {
      console.error('Error loading gastos:', error);
      throw error;
    }
  },

  agregarGasto: async (gasto) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const gastoDoc = await addDoc(collection(db, 'gastos'), {
        ...gasto,
        userId: user.uid,
        montoPagado: gasto.esFijo ? 0 : gasto.monto,
        estadoPago: gasto.esFijo ? 'pendiente' : 'pagado',
        pagos: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (!gasto.esFijo && gasto.cuenta) {
        const cuentaRef = doc(db, 'categoriasIngreso', gasto.cuenta);
        const cuentaDoc = await getDoc(cuentaRef);
        if (cuentaDoc.exists()) {
          await updateDoc(cuentaRef, {
            saldo: cuentaDoc.data().saldo - gasto.monto,
            updatedAt: serverTimestamp()
          });
        }
      }

      await get().cargarGastos();
    } catch (error) {
      console.error('Error adding gasto:', error);
      throw error;
    }
  },

  eliminarGasto: async (id) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const gasto = get().gastos.find(g => g.id === id);
      if (!gasto) throw new Error('Gasto no encontrado');

      if (!gasto.esFijo && gasto.cuenta) {
        const cuentaRef = doc(db, 'categoriasIngreso', gasto.cuenta);
        const cuentaDoc = await getDoc(cuentaRef);
        if (cuentaDoc.exists()) {
          await updateDoc(cuentaRef, {
            saldo: cuentaDoc.data().saldo + (gasto.montoPagado || 0),
            updatedAt: serverTimestamp()
          });
        }
      }

      await deleteDoc(doc(db, 'gastos', id));
      await get().cargarGastos();
    } catch (error) {
      console.error('Error deleting gasto:', error);
      throw error;
    }
  },

  eliminarTodosLosGastos: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const batch = writeBatch(db);
    const { gastos, categoriasIngreso } = get();

    try {
      const balanceUpdates = new Map<string, number>();
      gastos.forEach(gasto => {
        if (!gasto.esFijo && gasto.cuenta && gasto.montoPagado > 0) {
          const currentBalance = balanceUpdates.get(gasto.cuenta) || 0;
          balanceUpdates.set(gasto.cuenta, currentBalance + gasto.montoPagado);
        }
      });

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

      const gastosSnapshot = await getDocs(
        query(collection(db, 'gastos'), where('userId', '==', user.uid))
      );
      
      gastosSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      await get().cargarGastos();
    } catch (error) {
      console.error('Error deleting all gastos:', error);
      throw error;
    }
  },

  registrarPago: async (id, monto, cuenta) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const gastoRef = doc(db, 'gastos', id);
      const gastoDoc = await getDoc(gastoRef);
      
      if (!gastoDoc.exists()) {
        throw new Error('Gasto no encontrado');
      }

      const gasto = { id: gastoDoc.id, ...gastoDoc.data() } as Gasto;
      const montoRestante = gasto.monto - (gasto.montoPagado || 0);
      
      if (monto > montoRestante) {
        throw new Error('El monto excede el saldo pendiente');
      }

      const cuentaRef = doc(db, 'categoriasIngreso', cuenta);
      const cuentaDoc = await getDoc(cuentaRef);
      
      if (!cuentaDoc.exists()) {
        throw new Error('Cuenta no encontrada');
      }

      const cuentaData = cuentaDoc.data();
      if (cuentaData.saldo < monto) {
        throw new Error('Saldo insuficiente en la cuenta');
      }

      const batch = writeBatch(db);

      batch.update(cuentaRef, {
        saldo: cuentaData.saldo - monto,
        updatedAt: serverTimestamp()
      });

      const pagoRef = doc(collection(db, 'pagos'));
      const pagoData = {
        gastoId: id,
        cuenta,
        monto,
        fecha: serverTimestamp(),
        userId: user.uid
      };
      
      batch.set(pagoRef, pagoData);

      const nuevoMontoPagado = (gasto.montoPagado || 0) + monto;
      const nuevoEstadoPago = nuevoMontoPagado >= gasto.monto ? 'pagado' : 'parcial';
      
      batch.update(gastoRef, {
        montoPagado: nuevoMontoPagado,
        estadoPago: nuevoEstadoPago,
        pagos: [...(gasto.pagos || []), {
          id: pagoRef.id,
          ...pagoData
        }],
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      await get().cargarGastos();
    } catch (error) {
      console.error('Error registering payment:', error);
      throw error;
    }
  }
});