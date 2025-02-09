import { StateCreator } from 'zustand';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Credito } from '../../types';

export interface CreditosSlice {
  creditos: Credito[];
  cargarCreditos: () => Promise<void>;
  agregarCredito: (credito: Omit<Credito, 'id'>) => Promise<void>;
  adelantarCuotasCredito: (creditoId: string, monto: number, cuotas: number[]) => Promise<void>;
}

export const createCreditosSlice: StateCreator<CreditosSlice> = (set, get) => ({
  creditos: [],

  cargarCreditos: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const creditosSnapshot = await getDocs(
      query(collection(db, 'creditos'), where('userId', '==', user.uid))
    );
    
    const creditos = creditosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Credito[];

    set({ creditos });
  },

  agregarCredito: async (credito) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const batch = writeBatch(db);
    const creditoRef = doc(collection(db, 'creditos'));

    batch.set(creditoRef, {
      ...credito,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    await get().cargarCreditos();
  },

  adelantarCuotasCredito: async (creditoId: string, monto: number, cuotasSeleccionadas: number[]) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Get credit document
      const creditoRef = doc(db, 'creditos', creditoId);
      const creditoDoc = await getDoc(creditoRef);
      
      if (!creditoDoc.exists()) {
        throw new Error('Crédito no encontrado');
      }

      const creditoData = creditoDoc.data() as Omit<Credito, 'id'>;
      
      // Validate credit status
      if (creditoData.estado !== 'activo') {
        throw new Error('El crédito no está activo');
      }

      // Validate selected installments
      const cuotasInvalidas = cuotasSeleccionadas.filter(
        numero => !creditoData.cuotas.find(c => c.numero === numero && !c.pagada)
      );

      if (cuotasInvalidas.length > 0) {
        throw new Error('Algunas cuotas seleccionadas no son válidas o ya están pagadas');
      }

      // Calculate total amount to pay
      const montoTotal = creditoData.cuotas
        .filter(cuota => cuotasSeleccionadas.includes(cuota.numero))
        .reduce((sum, cuota) => sum + cuota.cuota, 0);

      if (Math.abs(montoTotal - monto) > 0.01) {
        throw new Error('El monto no coincide con el total de las cuotas seleccionadas');
      }

      // Update credit document
      const batch = writeBatch(db);
      const cuotasActualizadas = creditoData.cuotas.map(cuota => ({
        ...cuota,
        pagada: cuota.pagada || cuotasSeleccionadas.includes(cuota.numero)
      }));

      batch.update(creditoRef, {
        cuotas: cuotasActualizadas,
        montoRestante: creditoData.montoRestante - montoTotal,
        updatedAt: serverTimestamp()
      });

      // Create payment record
      const pagoRef = doc(collection(db, 'pagosCredito'));
      batch.set(pagoRef, {
        creditoId,
        monto,
        cuotasPagadas: cuotasSeleccionadas,
        fecha: serverTimestamp(),
        userId: user.uid
      });

      await batch.commit();
      await get().cargarCreditos();
    } catch (error: any) {
      console.error('Error al adelantar cuotas:', error);
      throw new Error(error.message || 'Error al procesar el adelanto de cuotas');
    }
  }
});