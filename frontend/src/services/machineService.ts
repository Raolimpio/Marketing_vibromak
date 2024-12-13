import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Machine } from '../types/Machine';

const COLLECTION = 'machines';

const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

const convertFromFirestore = (id: string, data: any): Machine => {
  return {
    id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt)
  } as Machine;
};

export const machineService = {
  async create(machine: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...machine,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, machine: Partial<Machine>): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...machine,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async getById(id: string): Promise<Machine | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return convertFromFirestore(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Erro ao buscar máquina:', error);
      throw error;
    }
  },

  async getAll(): Promise<Machine[]> {
    const q = query(collection(db, COLLECTION), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      convertFromFirestore(doc.id, doc.data())
    );
  },

  async getByClient(clientId: string): Promise<Machine[]> {
    const q = query(
      collection(db, COLLECTION),
      where("clientId", "==", clientId),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      convertFromFirestore(doc.id, doc.data())
    );
  }
};

export type { Machine };
