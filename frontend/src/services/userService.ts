import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updatePassword, getAuth, EmailAuthProvider, reauthenticateWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const COLLECTION_NAME = 'users';

export interface User {
  id?: string;
  email: string;
  name: string;
  isAdmin: boolean;
  password?: string;
  forcePasswordReset?: boolean;
}

export const userService = {
  async getAll(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  async create(user: Omit<User, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), user);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  async update(id: string, user: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  },

  async getUserNames(userIds: string[]): Promise<{ [key: string]: string }> {
    try {
      const users = await this.getAll();
      const userMap: { [key: string]: string } = {};
      
      users.forEach(user => {
        if (userIds.includes(user.id!)) {
          userMap[user.id!] = user.name;
        }
      });
      
      return userMap;
    } catch (error) {
      console.error('Erro ao buscar nomes dos usuários:', error);
      throw error;
    }
  },

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      // Atualizar apenas no Firestore
      const userRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        password: newPassword
      });
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  },
};
