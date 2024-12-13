import { format as fnsFormat } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export const format = (date: Date | Timestamp | number | null | undefined, formatStr: string): string => {
  if (!date) return '-';
  
  try {
    let dateValue: Date;
    
    if (date instanceof Timestamp) {
      dateValue = date.toDate();
    } else if (date instanceof Date) {
      dateValue = date;
    } else if (typeof date === 'number') {
      dateValue = new Date(date);
    } else {
      return '-';
    }

    if (isNaN(dateValue.getTime())) {
      return '-';
    }

    return fnsFormat(dateValue, formatStr, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return 'R$ 0,00';
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return 'R$ 0,00';
  }
};

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const formatCNPJ = (cnpj: string | null | undefined): string => {
  if (!cnpj) return '';
  
  const cleaned = cnpj.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
  }
  return cnpj;
};

export const formatCPF = (cpf: string | null | undefined): string => {
  if (!cpf) return '';
  
  const cleaned = cpf.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
};
