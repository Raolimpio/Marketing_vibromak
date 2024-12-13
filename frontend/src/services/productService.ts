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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Product, Video, Document } from '../types/Product';

const COLLECTION = 'products';

type FirestoreProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

const sanitizeData = (data: any) => {
  const sanitized = { ...data };
  
  // Remove campos undefined ou vazios
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined || sanitized[key] === '') {
      delete sanitized[key];
    }
  });

  // Limpa arrays vazios
  if (Array.isArray(sanitized.videos)) {
    sanitized.videos = sanitized.videos.filter((v: Video) => v.title && v.external_link);
  }
  if (Array.isArray(sanitized.documents)) {
    sanitized.documents = sanitized.documents.filter((d: Document) => d.title && d.external_link);
  }

  if (typeof sanitized.price === 'string') {
    sanitized.price = Number(sanitized.price.replace(/[^0-9.-]+/g, ''));
  }
  
  return sanitized;
};

const convertToFirestore = (product: Partial<Product>): Record<string, any> => {
  const sanitizedData = sanitizeData(product);
  
  // Certifica que arrays de vídeos e documentos não são undefined
  if (!sanitizedData.videos) sanitizedData.videos = [];
  if (!sanitizedData.documents) sanitizedData.documents = [];
  
  return {
    ...sanitizedData,
    updatedAt: serverTimestamp()
  };
};

const convertFromFirestore = (id: string, data: any): Product => {
  return {
    id,
    ...data,
    videos: data.videos || [],
    documents: data.documents || [],
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    machineIds: data.machineIds || []
  } as Product;
};

export const productService = {
  async uploadImage(file: File): Promise<string> {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  async deleteImage(imageUrl: string) {
    try {
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
    }
  },

  async getAll(): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      convertFromFirestore(doc.id, doc.data())
    );
  },

  async getByCategory(category: string): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION),
      where("category", "==", category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      convertFromFirestore(doc.id, doc.data())
    );
  },

  async getById(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFromFirestore(docSnap.id, docSnap.data());
    }
    
    return null;
  },

  async getByCode(code: string): Promise<Product | null> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('code', '==', code),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Product;
    } catch (error) {
      console.error('Erro ao buscar produto por código:', error);
      throw new Error('Erro ao buscar produto por código.');
    }
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const sanitizedData = sanitizeData(product);
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...sanitizedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      machineIds: product.machineIds || []
    });
    return docRef.id;
  },

  async update(id: string, product: Partial<Product>): Promise<void> {
    try {
      const sanitizedData = sanitizeData(product);
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...sanitizedData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    const product = await this.getById(id);
    if (product?.image) {
      await this.deleteImage(product.image);
    }
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  }
};
