import api from './api';

export interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: 'meeting' | 'task' | 'reminder';
  allDay?: boolean;
  location?: string;
  participants?: string[];
}

export const eventService = {
  async getAll(): Promise<Event[]> {
    try {
      const response = await api.get('/events');
      return response.data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  },

  async create(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      const response = await api.post('/events', event);
      return {
        ...response.data,
        start: new Date(response.data.start),
        end: new Date(response.data.end),
      };
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  },

  async update(id: number, event: Partial<Event>): Promise<Event> {
    try {
      const response = await api.put(`/events/${id}`, event);
      return {
        ...response.data,
        start: new Date(response.data.start),
        end: new Date(response.data.end),
      };
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/events/${id}`);
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      throw error;
    }
  },

  // Mock data para desenvolvimento
  getMockEvents(): Event[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: 1,
        title: 'Reunião com Cliente',
        start: today,
        end: new Date(today.setHours(today.getHours() + 2)),
        type: 'meeting',
        description: 'Discussão sobre novo projeto',
        location: 'Sala de Reuniões',
        participants: ['João', 'Maria', 'Pedro'],
      },
      {
        id: 2,
        title: 'Entrega de Relatório',
        start: tomorrow,
        end: tomorrow,
        type: 'task',
        description: 'Finalizar relatório mensal',
        allDay: true,
      },
      {
        id: 3,
        title: 'Lembrete: Pagamento',
        start: nextWeek,
        end: nextWeek,
        type: 'reminder',
        description: 'Efetuar pagamento de fornecedores',
      },
      {
        id: 4,
        title: 'Treinamento da Equipe',
        start: new Date(today.setDate(today.getDate() + 3)),
        end: new Date(today.setDate(today.getDate() + 3)),
        type: 'meeting',
        description: 'Treinamento sobre novo sistema',
        location: 'Auditório',
        participants: ['Toda a equipe'],
        allDay: true,
      },
    ];
  },
};
