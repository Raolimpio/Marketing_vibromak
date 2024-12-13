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
  serverTimestamp,
  FieldValue,
  arrayUnion, // adicionado
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { userService } from './userService';

export interface QuoteItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuoteStatus = 'enviado' | 'negociacao' | 'fechado' | 'perdido';

export interface QuoteStatusInfo {
  label: string;
  color: string;
  icon: string;
  nextStatuses: QuoteStatus[];
}

export const QUOTE_STATUS_INFO: Record<QuoteStatus, QuoteStatusInfo> = {
  enviado: {
    label: 'Enviado',
    color: 'primary',
    icon: 'send',
    nextStatuses: ['negociacao', 'fechado', 'perdido']
  },
  negociacao: {
    label: 'Em Negociação',
    color: 'warning',
    icon: 'handshake',
    nextStatuses: ['fechado', 'perdido']
  },
  fechado: {
    label: 'Fechado',
    color: 'success',
    icon: 'check_circle',
    nextStatuses: []
  },
  perdido: {
    label: 'Perdido',
    color: 'error',
    icon: 'cancel',
    nextStatuses: []
  }
};

export interface Quote {
  id?: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  date: Timestamp;
  items: QuoteItem[];
  subtotal: number;
  discount?: number;
  total: number;
  status: QuoteStatus;
  statusHistory?: {
    status: QuoteStatus;
    date: Timestamp;
    updatedBy: string;
  }[];
  transferHistory?: {
    fromUserId: string;
    toUserId: string;
    date: Timestamp;
    transferredBy: string;
  }[];
  notes?: string;
  createdBy: string;
  sellerName?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  lastUpdatedBy?: string;
}

const COLLECTION = 'quotes';

const convertTimestamp = (timestamp: any): Timestamp => {
  if (!timestamp) return Timestamp.now();
  if (timestamp instanceof Timestamp) return timestamp;
  if (timestamp instanceof Date) return Timestamp.fromDate(timestamp);
  return Timestamp.fromDate(new Date(timestamp));
};

const convertToFirestore = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Middleware de autenticação para verificar permissões
const checkPermissions = async (userId: string, quoteId: string, isAdmin: boolean = false): Promise<boolean> => {
  if (isAdmin) return true;
  
  const docRef = doc(db, COLLECTION, quoteId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return false;
  
  const quoteData = docSnap.data();
  // Permite acesso se o usuário criou a cotação ou se é o cliente da cotação
  return quoteData.createdBy === userId || quoteData.clientId === userId;
};

export const quoteService = {
  async getAll(userId: string, isAdmin: boolean = false): Promise<Quote[]> {
    try {
      let q;
      if (isAdmin) {
        // Admins podem ver todas as cotações
        q = query(
          collection(db, COLLECTION),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Usuários normais só veem suas próprias cotações
        // Solução temporária: primeiro buscamos por createdBy e depois ordenamos no cliente
        q = query(
          collection(db, COLLECTION),
          where('createdBy', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clientId: data.clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          date: convertTimestamp(data.date),
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total,
          status: data.status,
          statusHistory: data.statusHistory?.map((history: any) => ({
            ...history,
            date: convertTimestamp(history.date)
          })),
          transferHistory: data.transferHistory?.map((transfer: any) => ({
            ...transfer,
            date: convertTimestamp(transfer.date)
          })),
          notes: data.notes,
          createdBy: data.createdBy,
          sellerName: data.sellerName,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          lastUpdatedBy: data.lastUpdatedBy
        } as Quote;
      });
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      throw new Error('Erro ao buscar cotações. Por favor, tente novamente.');
    }
  },

  async getById(id: string, userId: string, isAdmin: boolean = false): Promise<Quote | null> {
    try {
      const hasPermission = await checkPermissions(userId, id, isAdmin);
      if (!hasPermission) {
        throw new Error('Você não tem permissão para acessar esta cotação');
      }

      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      const quote = {
        id: docSnap.id,
        clientId: data.clientId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        date: convertTimestamp(data.date),
        items: data.items,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        status: data.status,
        statusHistory: data.statusHistory?.map((history: any) => ({
          ...history,
          date: convertTimestamp(history.date)
        })),
        transferHistory: data.transferHistory?.map((transfer: any) => ({
          ...transfer,
          date: convertTimestamp(transfer.date)
        })),
        notes: data.notes,
        createdBy: data.createdBy,
        sellerName: data.sellerName,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        lastUpdatedBy: data.lastUpdatedBy
      } as Quote;

      // Adiciona informações do vendedor se for admin
      if (isAdmin && quote.createdBy) {
        const userDoc = await getDoc(doc(db, 'users', quote.createdBy));
        if (userDoc.exists()) {
          quote.sellerName = userDoc.data().name;
        }
      }

      return quote;
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      throw error;
    }
  },

  async create(quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>, userId: string): Promise<string> {
    try {
      // Validação dos campos obrigatórios
      if (!quote.clientId || !quote.clientName || !quote.items || quote.items.length === 0) {
        throw new Error('Campos obrigatórios não preenchidos');
      }

      // Garante que todos os campos numéricos sejam números válidos
      const quoteData = {
        ...quote,
        date: quote.date instanceof Date ? Timestamp.fromDate(quote.date) : quote.date,
        subtotal: Number(quote.subtotal) || 0,
        discount: Number(quote.discount) || 0,
        total: Number(quote.total) || 0,
        items: quote.items.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          total: Number(item.total) || 0
        })),
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION), quoteData);
      const quoteId = docRef.id;
      await this.addStatusHistory(quoteId, quote.status, userId);
      return quoteId;
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      throw new Error('Erro ao criar cotação. Por favor, tente novamente.');
    }
  },

  async addStatusHistory(quoteId: string, status: QuoteStatus, userId: string) {
    try {
      const quoteRef = doc(db, COLLECTION, quoteId);
      await updateDoc(quoteRef, {
        statusHistory: arrayUnion({ // corrigido
          status,
          date: serverTimestamp(),
          updatedBy: userId,
        }),
      });
    } catch (error) {
      console.error('Erro ao adicionar histórico de status:', error);
      throw new Error('Erro ao adicionar histórico de status.');
    }
  },

  async update(id: string, quote: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>>, userId: string, isAdmin: boolean = false): Promise<Quote> {
    try {
      const docRef = doc(db, COLLECTION, id);

      // Verifica permissões
      const hasPermission = await checkPermissions(userId, id, isAdmin);
      if (!hasPermission) {
        throw new Error('Sem permissão para atualizar esta cotação');
      }

      // Se houver mudança de status, adiciona ao histórico
      if (quote.status) {
        await this.addStatusHistory(id, quote.status, userId);
      }

      // Atualiza os campos básicos
      const updateData: Partial<Quote> & { updatedAt: FieldValue; lastUpdatedBy: string } = {
        updatedAt: serverTimestamp(),
        lastUpdatedBy: userId
      };

      // Copia apenas as propriedades definidas do quote para o updateData
      Object.keys(quote).forEach(key => {
        const value = quote[key as keyof typeof quote];
        if (value !== undefined) {
          if (key === 'date' && value instanceof Date) {
            (updateData as any)[key] = Timestamp.fromDate(value);
          } else {
            (updateData as any)[key] = value;
          }
        }
      });

      await updateDoc(docRef, updateData);

      // Retorna o documento atualizado
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Falha ao buscar cotação atualizada');
      }

      const data = updatedDoc.data();
      
      const updatedQuote = {
        id: updatedDoc.id,
        clientId: data.clientId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        date: convertTimestamp(data.date),
        items: data.items,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        status: data.status,
        statusHistory: data.statusHistory?.map((history: any) => ({
          ...history,
          date: convertTimestamp(history.date)
        })),
        transferHistory: data.transferHistory?.map((transfer: any) => ({
          ...transfer,
          date: convertTimestamp(transfer.date)
        })),
         notes: data.notes,
        createdBy: data.createdBy,
        sellerName: data.sellerName,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        lastUpdatedBy: data.lastUpdatedBy
      } as Quote;

      return updatedQuote;
    } catch (error) {
      console.error('Erro ao atualizar cotação:', error);
      throw error;
    }
  },

  async delete(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    try {
      const hasPermission = await checkPermissions(userId, id, isAdmin);
      if (!hasPermission) {
        throw new Error('Você não tem permissão para deletar esta cotação');
      }

      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar cotação:', error);
      throw error;
    }
  },

  async getByStatus(status: Quote['status'], userId: string, isAdmin: boolean = false): Promise<Quote[]> {
    let q;
    
    if (isAdmin) {
      q = query(
        collection(db, COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, COLLECTION),
        where('status', '==', status),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
         clientId: data.clientId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        date: convertTimestamp(data.date),
        items: data.items,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        status: data.status,
        statusHistory: data.statusHistory?.map((history: any) => ({
          ...history,
          date: convertTimestamp(history.date)
        })),
        transferHistory: data.transferHistory?.map((transfer: any) => ({
          ...transfer,
          date: convertTimestamp(transfer.date)
        })),
         notes: data.notes,
        createdBy: data.createdBy,
        sellerName: data.sellerName,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        lastUpdatedBy: data.lastUpdatedBy
      } as Quote;
    });
  },

  async getByClientId(clientId: string, userId: string, isAdmin: boolean = false): Promise<Quote[]> {
    try {
      let q;
      
      if (isAdmin) {
        q = query(
          collection(db, COLLECTION),
          where('clientId', '==', clientId)
        );
      } else {
        q = query(
          collection(db, COLLECTION),
          where('clientId', '==', clientId),
          where('createdBy', '==', userId)
        );
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
           clientId: data.clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          date: convertTimestamp(data.date),
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total,
          status: data.status,
          statusHistory: data.statusHistory?.map((history: any) => ({
            ...history,
            date: convertTimestamp(history.date)
          })),
          transferHistory: data.transferHistory?.map((transfer: any) => ({
            ...transfer,
            date: convertTimestamp(transfer.date)
          })),
           notes: data.notes,
          createdBy: data.createdBy,
          sellerName: data.sellerName,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          lastUpdatedBy: data.lastUpdatedBy
        } as Quote;
      });
    } catch (error) {
      console.error('Erro ao buscar orçamentos do cliente:', error);
      return [];
    }
  },

  async getTransferredQuotes(userId: string, isAdmin: boolean = false): Promise<Quote[]> {
    try {
      const quotesRef = collection(db, COLLECTION);
      let q;

      if (isAdmin) {
        // Admin vê todas as cotações que têm histórico de transferência
        q = query(
          quotesRef,
          where('transferHistory', '!=', null)
        );
      } else {
        // Usuário normal vê cotações onde ele está no histórico de transferência
        q = query(
          quotesRef,
          where('transferHistory', '!=', null)
        );
      }

      const querySnapshot = await getDocs(q);
      const quotes: Quote[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const quote = {
          ...data,
          id: doc.id,
          clientId: data.clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          date: convertTimestamp(data.date),
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total,
          status: data.status,
          statusHistory: data.statusHistory?.map((history: any) => ({
            ...history,
            date: convertTimestamp(history.date)
          })),
          transferHistory: data.transferHistory?.map((transfer: any) => ({
            ...transfer,
            date: convertTimestamp(transfer.date)
          })),
           notes: data.notes,
          createdBy: data.createdBy,
          sellerName: data.sellerName,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          lastUpdatedBy: data.lastUpdatedBy
        } as Quote;

        // Filtra localmente para usuários não-admin
        if (!isAdmin) {
          const isInvolvedInTransfer = quote.transferHistory?.some(
            (transfer: any) => transfer.fromUserId === userId || transfer.toUserId === userId
          );
          if (!isInvolvedInTransfer) return;
        }

        quotes.push(quote);
      });

      // Ordena por data mais recente
      return quotes.sort((a, b) => (b.date?.toDate().getTime() || 0) - (a.date?.toDate().getTime() || 0));
    } catch (error) {
      console.error('Erro ao buscar cotações transferidas:', error);
      throw new Error('Não foi possível buscar as cotações transferidas');
    }
  },

  async transferQuote(
    quoteId: string,
    fromUserId: string,
    toUserId: string,
    isAdmin: boolean = false
  ): Promise<void> {
    try {
      // Verifica permissões
      const hasPermission = await checkPermissions(fromUserId, quoteId, isAdmin);
      if (!hasPermission) {
        throw new Error('Sem permissão para transferir esta cotação');
      }

      const quoteRef = doc(db, COLLECTION, quoteId);
      const quoteDoc = await getDoc(quoteRef);

      if (!quoteDoc.exists()) {
        throw new Error('Cotação não encontrada');
      }

      const quoteData = quoteDoc.data();
      const transferHistory = quoteData.transferHistory || [];

      // Adiciona novo registro no histórico de transferências
      const transfer = {
        fromUserId,
        toUserId,
        date: serverTimestamp(),
        transferredBy: fromUserId
      };

      // Atualiza a cotação
      await updateDoc(quoteRef, {
        transferHistory: [...transferHistory, transfer],
        lastUpdatedBy: fromUserId,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Erro ao transferir cotação:', error);
      throw new Error('Não foi possível transferir a cotação');
    }
  },

  async getQuotesByClient(clientId: string) {
    try {
      const quotesRef = collection(db, 'quotes');
      const q = query(
        quotesRef,
        where('clientId', '==', clientId)
      );
      
      const querySnapshot = await getDocs(q);
      const quotes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clientId: data.clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          date: convertTimestamp(data.date),
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total,
          status: data.status,
          statusHistory: data.statusHistory?.map((history: any) => ({
            ...history,
            date: convertTimestamp(history.date)
          })),
          transferHistory: data.transferHistory?.map((transfer: any) => ({
            ...transfer,
             date: convertTimestamp(transfer.date)
          })),
           notes: data.notes,
          createdBy: data.createdBy,
          sellerName: data.sellerName,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          lastUpdatedBy: data.lastUpdatedBy
        }
      });

      // Ordenar por data localmente
      quotes.sort((a, b) => {
        const dateA = a.date;
        const dateB = b.date;
        return dateB.toMillis() - dateA.toMillis(); // ordem decrescente
      });

      // Fetch user names for transfer history
      const userIds = new Set<string>();
      quotes.forEach(quote => {
        if (quote.createdBy) userIds.add(quote.createdBy);
        if (quote.transferHistory) {
          quote.transferHistory.forEach((transfer: any) => {
            if (transfer.fromUserId) userIds.add(transfer.fromUserId);
            if (transfer.toUserId) userIds.add(transfer.toUserId);
          });
        }
      });

      const userNames = await userService.getUserNames(Array.from(userIds));

      return quotes.map(quote => ({
        ...quote,
         createdByName: userNames[quote.createdBy] || 'Usuário Desconhecido',
        transferHistory: quote.transferHistory?.map((transfer: any) => ({
          ...transfer,
          fromUserName: userNames[transfer.fromUserId] || 'Usuário Desconhecido',
          toUserName: userNames[transfer.toUserId] || 'Usuário Desconhecido',
          date: transfer.date
        }))
      }));
    } catch (error) {
      console.error('Error fetching quotes by client:', error);
      throw error;
    }
  },
};
