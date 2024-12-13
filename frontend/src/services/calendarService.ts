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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: 'meeting' | 'visit' | 'reminder' | 'quote';
  clientId?: string;
  quoteId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'events';

export const calendarService = {
  async getAll(): Promise<CalendarEvent[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as CalendarEvent[];
  },

  async getByDateRange(start: Date, end: Date): Promise<CalendarEvent[]> {
    const q = query(
      collection(db, COLLECTION),
      where('start', '>=', start),
      where('start', '<=', end)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as CalendarEvent[];
  },

  async create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...event,
      start: Timestamp.fromDate(event.start),
      end: Timestamp.fromDate(event.end),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  async update(id: string, event: Partial<CalendarEvent>): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    const updateData = {
      ...event,
      updatedAt: new Date()
    };

    if (event.start) {
      updateData.start = Timestamp.fromDate(event.start);
    }
    if (event.end) {
      updateData.end = Timestamp.fromDate(event.end);
    }

    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  },

  async getByClient(clientId: string): Promise<CalendarEvent[]> {
    const q = query(
      collection(db, COLLECTION),
      where('clientId', '==', clientId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as CalendarEvent[];
  }
};
