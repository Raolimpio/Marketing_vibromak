import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA2YXEoJXR0DOsIwbOa6R75Ka07Buvls6k",
  authDomain: "vibromakmkt-v3.firebaseapp.com",
  projectId: "vibromakmkt-v3",
  storageBucket: "vibromakmkt-v3.firebasestorage.app",
  messagingSenderId: "414114999641",
  appId: "1:414114999641:web:77dbee137b9fb628bef048",
  measurementId: "G-1980MQ6TE3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Produtos de exemplo
const products = [
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
  }
];

// Clientes de exemplo
const clients = [
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
  }
];

// Função para gerar datas aleatórias
function generateRandomDate(startHour = 8, endHour = 18) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);
  
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  date.setHours(startHour + Math.floor(Math.random() * (endHour - startHour)));
  date.setMinutes(Math.round(Math.random() * 4) * 15);
  
  return date;
}

// Gerar produtos
async function generateProducts() {
  console.log('Gerando produtos...');
  const productsRef = collection(db, 'products');
  
  for (const product of products) {
    try {
      const docRef = await addDoc(productsRef, {
        ...product,
        image: `https://picsum.photos/seed/${product.code}/400/300`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Produto criado: ${product.name} (${docRef.id})`);
    } catch (error) {
      console.error(`Erro ao criar produto ${product.name}:`, error);
    }
  }
}

// Gerar clientes
async function generateClients() {
  console.log('Gerando clientes...');
  const clientsRef = collection(db, 'clients');
  
  for (const client of clients) {
    try {
      const docRef = await addDoc(clientsRef, {
        ...client,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Cliente criado: ${client.name} (${docRef.id})`);
    } catch (error) {
      console.error(`Erro ao criar cliente ${client.name}:`, error);
    }
  }
}

// Gerar eventos
async function generateEvents() {
  console.log('Gerando eventos...');
  const eventsRef = collection(db, 'events');
  const clientsSnapshot = await getDocs(collection(db, 'clients'));
  
  for (const clientDoc of clientsSnapshot.docs) {
    const client = { id: clientDoc.id, ...clientDoc.data() };
    
    // 2 eventos por cliente
    for (let i = 0; i < 2; i++) {
      const start = generateRandomDate();
      const end = new Date(start.getTime() + (2 * 60 * 60 * 1000));
      
      try {
        await addDoc(eventsRef, {
          title: `Reunião com ${client.name}`,
          description: 'Evento automático gerado para teste',
          start,
          end,
          type: 'meeting',
          clientId: client.id,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Evento criado para ${client.name}`);
      } catch (error) {
        console.error(`Erro ao criar evento para ${client.name}:`, error);
      }
    }
  }
}

// Gerar orçamentos
async function generateQuotes() {
  console.log('Gerando orçamentos...');
  const quotesRef = collection(db, 'quotes');
  const clientsSnapshot = await getDocs(collection(db, 'clients'));
  const productsSnapshot = await getDocs(collection(db, 'products'));
  
  const products = productsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  for (const clientDoc of clientsSnapshot.docs) {
    const client = { id: clientDoc.id, ...clientDoc.data() };
    
    // 2 orçamentos por cliente
    for (let i = 0; i < 2; i++) {
      const numProducts = Math.floor(Math.random() * 2) + 1;
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const total = product.price * quantity;
        subtotal += total;
        
        items.push({
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          total
        });
      }
      
      const discount = Math.random() < 0.3 ? subtotal * 0.1 : 0;
      const total = subtotal - discount;
      
      try {
        await addDoc(quotesRef, {
          number: `ORC-${Date.now()}-${i}`,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone,
          date: new Date(),
          items,
          subtotal,
          discount,
          total,
          status: ['draft', 'sent', 'approved', 'rejected'][Math.floor(Math.random() * 4)],
          notes: 'Orçamento gerado automaticamente para teste',
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Orçamento criado para ${client.name}`);
      } catch (error) {
        console.error(`Erro ao criar orçamento para ${client.name}:`, error);
      }
    }
  }
}

// Gerar todos os dados
async function generateAllData() {
  try {
    console.log('Iniciando geração de dados de teste...');
    
    await generateProducts();
    await generateClients();
    await generateEvents();
    await generateQuotes();
    
    console.log('Geração de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a geração de dados:', error);
  }
}

// Executar
generateAllData();
