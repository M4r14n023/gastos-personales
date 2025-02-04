import { StateCreator } from 'zustand';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Credito } from '../../types';

export interface CreditosSlice {
  creditos: Credito[];
  cargarCreditos: () => Promise<void>;
}

export const createCreditosSlice: StateCreator<CreditosSlice> = (set) => ({
  creditos: [],
  cargarCreditos: async () => {
    const user = auth.currentUser;
    if (!user) return;

    const creditosSnapshot = await getDocs(
      query(collection(db, 'creditos'), where('userId', '==', user.uid))
    );
    
    const creditos = creditosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Credito[];

    set({ creditos });
  }
});