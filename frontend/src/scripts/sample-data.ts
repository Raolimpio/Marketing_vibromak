export const products = [
  {
    name: "Vibrador de Concreto VCI-2",
    code: "VCI-2-2024",
    category: "Vibradores",
    description: "Vibrador de concreto profissional com mangote de 2 metros, ideal para obras de médio porte.",
    price: 2899.90,
    specs: {
      "Potência": "2.0 HP",
      "Comprimento do Mangote": "2 metros",
      "Diâmetro da Agulha": "38mm",
      "Rotação": "3500 RPM",
      "Tensão": "220V",
      "Peso": "5.8 kg",
      "Garantia": "12 meses"
    }
  },
  {
    name: "Acabadora de Piso AC-3000",
    code: "AC3000-2024",
    category: "Acabadoras",
    description: "Acabadora de piso profissional para grandes superfícies. Alta durabilidade e acabamento perfeito.",
    price: 4599.90,
    specs: {
      "Potência": "3.0 HP",
      "Diâmetro": "90 cm",
      "Rotação": "60-130 RPM",
      "Tensão": "220V",
      "Peso": "75 kg",
      "Garantia": "12 meses"
    }
  },
  {
    name: "Régua Vibratória RV-4",
    code: "RV4-2024",
    category: "Réguas Vibratórias",
    description: "Régua vibratória profissional de 4 metros, perfeita para nivelamento de grandes áreas.",
    price: 3299.90,
    specs: {
      "Comprimento": "4 metros",
      "Motor": "Honda GX35",
      "Potência": "1.5 HP",
      "Peso": "20 kg",
      "Garantia": "12 meses"
    }
  },
  {
    name: "Cortadora de Piso CP-500",
    code: "CP500-2024",
    category: "Cortadoras",
    description: "Cortadora de piso profissional para cortes precisos em concreto e asfalto.",
    price: 5999.90,
    specs: {
      "Motor": "Honda GX390",
      "Potência": "13 HP",
      "Profundidade de Corte": "170mm",
      "Diâmetro do Disco": "500mm",
      "Peso": "95 kg",
      "Garantia": "12 meses"
    }
  },
  {
    name: "Alisadora de Concreto AL-90",
    code: "AL90-2024",
    category: "Alisadoras",
    description: "Alisadora de concreto profissional para acabamento perfeito em grandes áreas.",
    price: 6499.90,
    specs: {
      "Motor": "Honda GX270",
      "Potência": "9 HP",
      "Diâmetro": "90 cm",
      "Rotação": "60-130 RPM",
      "Peso": "85 kg",
      "Garantia": "12 meses"
    }
  }
];

export const clients = [
  {
    name: "Construtora Silva & Silva",
    email: "contato@silvasilva.com.br",
    phone: "(11) 3456-7890",
    company: "Silva & Silva Construções Ltda",
    address: {
      street: "Av. Paulista",
      number: "1000",
      complement: "Sala 1010",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100"
    },
    notes: "Cliente premium, obras de grande porte"
  },
  {
    name: "João Carlos Construções",
    email: "joao@jcconstrucoes.com.br",
    phone: "(11) 98765-4321",
    company: "JC Construções ME",
    address: {
      street: "Rua das Palmeiras",
      number: "123",
      city: "Campinas",
      state: "SP",
      zipCode: "13015-300"
    },
    notes: "Especializado em reformas comerciais"
  },
  {
    name: "Construtora Horizonte",
    email: "contato@horizonteconstrutora.com.br",
    phone: "(11) 2345-6789",
    company: "Horizonte Empreendimentos Ltda",
    address: {
      street: "Av. Brasil",
      number: "500",
      complement: "Andar 15",
      city: "São Paulo",
      state: "SP",
      zipCode: "01430-001"
    },
    notes: "Grandes obras residenciais"
  },
  {
    name: "Roberto Engenharia",
    email: "roberto@rengenhariasp.com.br",
    phone: "(11) 97654-3210",
    company: "Roberto Engenharia Ltda",
    address: {
      street: "Rua dos Andradas",
      number: "789",
      city: "Santo André",
      state: "SP",
      zipCode: "09020-010"
    },
    notes: "Especialista em fundações"
  },
  {
    name: "ABC Construções",
    email: "contato@abcconstrucoes.com.br",
    phone: "(11) 3333-4444",
    company: "ABC Construções e Reformas Ltda",
    address: {
      street: "Av. Industrial",
      number: "1500",
      complement: "Galpão 7",
      city: "São Bernardo do Campo",
      state: "SP",
      zipCode: "09750-000"
    },
    notes: "Obras industriais e comerciais"
  }
];

// Tipos de eventos para gerar compromissos realistas
export const eventTypes = [
  {
    type: 'meeting',
    titles: [
      'Reunião de apresentação',
      'Discussão de orçamento',
      'Visita técnica',
      'Acompanhamento de obra',
      'Entrega de equipamentos'
    ]
  },
  {
    type: 'visit',
    titles: [
      'Visita à obra',
      'Demonstração de equipamento',
      'Inspeção técnica',
      'Manutenção preventiva',
      'Treinamento in loco'
    ]
  },
  {
    type: 'reminder',
    titles: [
      'Follow-up cliente',
      'Renovação de contrato',
      'Manutenção programada',
      'Cobrança pendente',
      'Retorno de orçamento'
    ]
  }
];

// Função para gerar datas aleatórias nos próximos 30 dias
export function generateRandomDate(startHour = 8, endHour = 18) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);
  
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
  // Ajustar para horário comercial
  date.setHours(startHour + Math.floor(Math.random() * (endHour - startHour)));
  date.setMinutes(Math.round(Math.random() * 4) * 15); // Intervalos de 15 minutos
  
  return date;
}

// Status possíveis para orçamentos
export const quoteStatus = ['enviado', 'negociacao', 'fechado', 'perdido'] as const;
