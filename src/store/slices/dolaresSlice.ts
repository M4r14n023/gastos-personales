import { StateCreator } from 'zustand';
import { doc, writeBatch, serverTimestamp, getDocs, query, where, collection, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { ComprarDolaresParams, VenderDolaresParams, PagarDolaresParams, MovimientoDolar } from '../../types';

export interface DolaresSlice {
  saldoDolares: number;
  movimientosDolares: MovimientoDolar[];
  comprarDolares: (params: ComprarDolaresParams) => Promise<void>;
  venderDolares: (params: VenderDolaresParams) => Promise<void>;
  pagarDolares: (params: PagarDolaresParams) => Promise<void>;
  cargarMovimientosDolares: () => Promise<void>;
}

export const createDolaresSlice: StateCreator<DolaresSlice> = (set, get) => ({
  saldoDolares: 0,
  movimientosDolares: [],

  comprarDolares: async ({ montoDolares, cotizacion, cuenta }) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const batch = writeBatch(db);
    
    // Update account balance
    const cuentaRef = doc(db, 'categoriasIngreso', cuenta);
    const cuentaDoc = await getDoc(cuentaRef);
    if (!cuentaDoc.exists()) throw new Error('Cuenta no encontrada');
    
    const cuentaData = cuentaDoc.data();
    const montoPesos = montoDolares * cotizacion;
    
    if (cuentaData.saldo < montoPesos) throw new Error('Saldo insuficiente');
    
    batch.update(cuentaRef, {
      saldo: cuentaData.saldo - montoPesos,
      updatedAt: serverTimestamp()
    });
    
    // Update dollar balance
    const userRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userRef);
    const saldoDolaresActual = userDoc.exists() ? (userDoc.data()?.saldoDolares || 0) : 0;
    const nuevoSaldoDolares = saldoDolaresActual + montoDolares;
    
    batch.set(userRef, {
      saldoDolares: nuevoSaldoDolares,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Create movement record
    const movimientoRef = doc(collection(db, 'movimientosDolares'));
    batch.set(movimientoRef, {
      tipo: 'compra',
      montoDolares,
      cotizacion,
      montoPesos,
      cuenta,
      descripcion: `Compra de USD ${montoDolares.toFixed(2)} a $${cotizacion.toFixed(2)}`,
      fecha: serverTimestamp(),
      userId: user.uid
    });
    
    await batch.commit();

    // Update local state immediately after successful transaction
    set({ saldoDolares: nuevoSaldoDolares });
    await get().cargarMovimientosDolares();
  },

  venderDolares: async ({ montoDolares, cotizacion, cuenta }) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const batch = writeBatch(db);
    
    // Verify dollar balance
    const userRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userRef);
    const saldoDolaresActual = userDoc.exists() ? (userDoc.data()?.saldoDolares || 0) : 0;
    
    if (saldoDolaresActual < montoDolares) throw new Error('Saldo en dólares insuficiente');
    
    const nuevoSaldoDolares = saldoDolaresActual - montoDolares;
    
    batch.set(userRef, {
      saldoDolares: nuevoSaldoDolares,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update account balance
    const cuentaRef = doc(db, 'categoriasIngreso', cuenta);
    const cuentaDoc = await getDoc(cuentaRef);
    if (!cuentaDoc.exists()) throw new Error('Cuenta no encontrada');
    
    const cuentaData = cuentaDoc.data();
    const montoPesos = montoDolares * cotizacion;
    
    batch.update(cuentaRef, {
      saldo: cuentaData.saldo + montoPesos,
      updatedAt: serverTimestamp()
    });
    
    // Create movement record
    const movimientoRef = doc(collection(db, 'movimientosDolares'));
    batch.set(movimientoRef, {
      tipo: 'venta',
      montoDolares,
      cotizacion,
      montoPesos,
      cuenta,
      descripcion: `Venta de USD ${montoDolares.toFixed(2)} a $${cotizacion.toFixed(2)}`,
      fecha: serverTimestamp(),
      userId: user.uid
    });
    
    await batch.commit();
    
    // Update local state immediately after successful transaction
    set({ saldoDolares: nuevoSaldoDolares });
    await get().cargarMovimientosDolares();
  },

  pagarDolares: async ({ montoDolares, descripcion }) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const batch = writeBatch(db);
    
    // Verify dollar balance
    const userRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userRef);
    const saldoDolaresActual = userDoc.exists() ? (userDoc.data()?.saldoDolares || 0) : 0;
    
    if (saldoDolaresActual < montoDolares) throw new Error('Saldo en dólares insuficiente');
    
    const nuevoSaldoDolares = saldoDolaresActual - montoDolares;
    
    batch.set(userRef, {
      saldoDolares: nuevoSaldoDolares,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Create movement record
    const movimientoRef = doc(collection(db, 'movimientosDolares'));
    batch.set(movimientoRef, {
      tipo: 'pago',
      montoDolares,
      descripcion,
      fecha: serverTimestamp(),
      userId: user.uid
    });
    
    await batch.commit();
    
    // Update local state immediately after successful transaction
    set({ saldoDolares: nuevoSaldoDolares });
    await get().cargarMovimientosDolares();
  },

  cargarMovimientosDolares: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Load user data to get current balance
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      const saldoDolares = userDoc.exists() ? (userDoc.data()?.saldoDolares || 0) : 0;

      // Load movements
      const movimientosSnapshot = await getDocs(
        query(collection(db, 'movimientosDolares'), where('userId', '==', user.uid))
      );
      
      const movimientos = movimientosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MovimientoDolar[];

      set({ 
        saldoDolares,
        movimientosDolares: movimientos 
      });
    } catch (error) {
      console.error('Error loading dollar movements:', error);
      throw error;
    }
  }
});