import { collection, query, where, getDocs, getDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Quote } from './quoteService';

export interface Statistics {
  openQuotes: Quote[];
  negotiatingQuotes: Quote[];
  lostQuotes: Quote[];
  closedQuotes: Quote[];
  userId?: string;
  userName?: string;
}

export interface UserStatistics extends Statistics {
  userId: string;
  userName: string;
}

export const statisticsService = {
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  async getAll(): Promise<UserStatistics[]> {
    try {
      const usersStats: UserStatistics[] = [];
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);

      for (const userDoc of usersSnapshot.docs) {
        const stats = await this.getUserStats(userDoc.id);
        usersStats.push({
          ...stats,
          userId: userDoc.id,
          userName: userDoc.data().name || 'Usuário'
        });
      }

      return usersStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  async getUserStats(userId: string, startDate?: Date, endDate?: Date): Promise<Statistics> {
    try {
      console.log('Buscando estatísticas para:', { userId, startDate, endDate });
      
      // Primeiro, busca todos os orçamentos do usuário
      const quotesQuery = query(collection(db, 'quotes'), where('createdBy', '==', userId));
      const quotesSnapshot = await getDocs(quotesQuery);
      
      // Depois filtra as datas em memória
      let quotes = quotesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Quote[];
      console.log('Orçamentos encontrados:', quotes.length);
      console.log('Status dos orçamentos:', quotes.map(q => ({ id: q.id, status: q.status })));
      
      if (startDate) {
        quotes = quotes.filter(quote => {
          const quoteDate = quote.date instanceof Timestamp ? 
            quote.date.toDate() : 
            new Date();
          return quoteDate >= startDate;
        });
        console.log('Após filtro de data inicial:', quotes.length);
      }
      
      if (endDate) {
        quotes = quotes.filter(quote => {
          const quoteDate = quote.date instanceof Timestamp ? 
            quote.date.toDate() : 
            new Date();
          return quoteDate <= endDate;
        });
        console.log('Após filtro de data final:', quotes.length);
      }

      // Buscar dados do usuário
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      // Conta os orçamentos por status
      const openQuotes = quotes.filter(quote => quote.status === 'enviado');
      const negotiatingQuotes = quotes.filter(quote => quote.status === 'negociacao');
      const lostQuotes = quotes.filter(quote => quote.status === 'perdido');
      const closedQuotes = quotes.filter(quote => quote.status === 'fechado');

      console.log('Status de cada orçamento:', quotes.map(q => ({ id: q.id, status: q.status })));
      console.log('Contagem por status:', {
        enviado: { ids: openQuotes.map(q => q.id), count: openQuotes.length },
        negociacao: { ids: negotiatingQuotes.map(q => q.id), count: negotiatingQuotes.length },
        perdido: { ids: lostQuotes.map(q => q.id), count: lostQuotes.length },
        fechado: { ids: closedQuotes.map(q => q.id), count: closedQuotes.length }
      });

      const stats = {
        openQuotes,
        negotiatingQuotes,
        lostQuotes,
        closedQuotes,
        userId,
        userName: userData?.name || 'Usuário'
      };

      console.log('Estatísticas calculadas:', {
        userId,
        total: quotes.length,
        porStatus: {
          enviado: stats.openQuotes.length,
          negociacao: stats.negotiatingQuotes.length,
          perdido: stats.lostQuotes.length,
          fechado: stats.closedQuotes.length
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      throw error;
    }
  },

  async getAllUsersStats(startDate?: Date, endDate?: Date): Promise<Statistics> {
    try {
      // Busca todos os orçamentos
      const quotesQuery = query(collection(db, 'quotes'));
      const quotesSnapshot = await getDocs(quotesQuery);
      
      // Filtra as datas em memória
      let quotes = quotesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Quote[];
      console.log('Total de orçamentos encontrados:', quotes.length);
      
      if (startDate) {
        quotes = quotes.filter(quote => {
          const quoteDate = quote.date instanceof Timestamp ? 
            quote.date.toDate() : 
            new Date();
          return quoteDate >= startDate;
        });
        console.log('Após filtro de data inicial:', quotes.length);
      }
      
      if (endDate) {
        quotes = quotes.filter(quote => {
          const quoteDate = quote.date instanceof Timestamp ? 
            quote.date.toDate() : 
            new Date();
          return quoteDate <= endDate;
        });
        console.log('Após filtro de data final:', quotes.length);
      }

      // Conta os orçamentos por status
      const stats = {
        openQuotes: quotes.filter(quote => quote.status === 'enviado'),
        negotiatingQuotes: quotes.filter(quote => quote.status === 'negociacao'),
        lostQuotes: quotes.filter(quote => quote.status === 'perdido'),
        closedQuotes: quotes.filter(quote => quote.status === 'fechado')
      };

      console.log('Estatísticas totais calculadas:', {
        total: quotes.length,
        porStatus: {
          enviado: stats.openQuotes.length,
          negociacao: stats.negotiatingQuotes.length,
          perdido: stats.lostQuotes.length,
          fechado: stats.closedQuotes.length
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais:', error);
      throw error;
    }
  }
};
