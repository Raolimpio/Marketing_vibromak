import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Category } from '../types/Category';

const COLLECTION = 'categories';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION));
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      
      // Sort in memory instead
      return categories.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Erro ao buscar categorias.');
    }
  },

  async getById(id: string): Promise<Category | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Category;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      throw new Error('Erro ao buscar categoria.');
    }
  },

  async create(category: Omit<Category, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), category);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new Error('Erro ao criar categoria.');
    }
  },

  async update(id: string, category: Partial<Category>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, category);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw new Error('Erro ao atualizar categoria.');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      throw new Error('Erro ao excluir categoria.');
    }
  }
};

export type { Category };
