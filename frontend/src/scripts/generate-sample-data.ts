import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { products, clients, eventTypes, generateRandomDate, quoteStatus } from './sample-data';
import { productService } from '../services/productService';
import { clientService } from '../services/clientService';
import { calendarService } from '../services/calendarService';
import { quoteService } from '../services/quoteService';

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

// ID do usuário que está criando os dados
const CREATOR_ID = 'system';

async function generateProducts() {
  console.log('Gerando produtos...');
  const productIds = [];
  
  for (const product of products) {
    try {
      const id = await productService.create({
        ...product,
        image: `https://picsum.photos/seed/${product.code}/400/300` // Imagem aleatória para teste
      });
      productIds.push(id);
      console.log(`Produto criado: ${product.name} (${id})`);
    } catch (error) {
      console.error(`Erro ao criar produto ${product.name}:`, error);
    }
  }
  
  return productIds;
}

async function generateClients() {
  console.log('Gerando clientes...');
  const clientIds = [];
  
  for (const client of clients) {
    try {
      const id = await clientService.create(client);
      clientIds.push(id);
      console.log(`Cliente criado: ${client.name} (${id})`);
    } catch (error) {
      console.error(`Erro ao criar cliente ${client.name}:`, error);
    }
  }
  
  return clientIds;
}

async function generateEvents(clientIds: string[]) {
  console.log('Gerando eventos...');
  
  for (const clientId of clientIds) {
    // Gerar 2 eventos por cliente
    for (let i = 0; i < 2; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const title = eventType.titles[Math.floor(Math.random() * eventType.titles.length)];
      
      const start = generateRandomDate();
      const end = new Date(start.getTime() + (2 * 60 * 60 * 1000)); // 2 horas depois
      
      try {
        await calendarService.create({
          title,
          description: `Evento automático gerado para teste`,
          start,
          end,
          type: eventType.type as any,
          clientId,
          createdBy: CREATOR_ID
        });
        console.log(`Evento criado: ${title}`);
      } catch (error) {
        console.error(`Erro ao criar evento ${title}:`, error);
      }
    }
  }
}

async function generateQuotes(clientIds: string[], productIds: string[]) {
  console.log('Gerando orçamentos...');
  
  for (const clientId of clientIds) {
    const client = await clientService.getById(clientId);
    if (!client) continue;
    
    // Gerar 2 orçamentos por cliente
    for (let i = 0; i < 2; i++) {
      // Selecionar 1-3 produtos aleatórios
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < numProducts; j++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const product = await productService.getById(productId);
        if (!product) continue;
        
        const quantity = Math.floor(Math.random() * 3) + 1;
        const total = (product.price || 0) * quantity;
        subtotal += total;
        
        items.push({
          productId,
          productName: product.name,
          quantity,
          unitPrice: product.price || 0,
          total
        });
      }
      
      const discount = Math.random() < 0.3 ? subtotal * 0.1 : 0; // 30% de chance de ter 10% de desconto
      const total = subtotal - discount;
      
      try {
        await quoteService.create({
          number: `ORC-${Date.now()}-${i}`,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone,
          date: new Date(),
          items,
          subtotal,
          discount,
          total,
          status: quoteStatus[Math.floor(Math.random() * quoteStatus.length)],
          notes: 'Orçamento gerado automaticamente para teste',
          createdBy: CREATOR_ID
        });
        console.log(`Orçamento criado para ${client.name}`);
      } catch (error) {
        console.error(`Erro ao criar orçamento para ${client.name}:`, error);
      }
    }
  }
}

async function generateAllData() {
  try {
    console.log('Iniciando geração de dados de teste...');
    
    const productIds = await generateProducts();
    console.log(`${productIds.length} produtos criados`);
    
    const clientIds = await generateClients();
    console.log(`${clientIds.length} clientes criados`);
    
    await generateEvents(clientIds);
    console.log('Eventos criados');
    
    await generateQuotes(clientIds, productIds);
    console.log('Orçamentos criados');
    
    console.log('Geração de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a geração de dados:', error);
  }
}

// Executar geração de dados
generateAllData();
