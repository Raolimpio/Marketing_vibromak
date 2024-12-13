import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

const sampleProduct = {
  name: "Notebook Dell Inspiron 15",
  code: "DELL-INS15-2024",
  category: "Notebooks",
  description: `Notebook Dell Inspiron 15 com processador Intel Core i7 de última geração, 
    ideal para trabalho e entretenimento. Design elegante e performance excepcional.
    
    Principais características:
    - Processador Intel Core i7 12ª geração
    - 16GB RAM DDR4
    - SSD 512GB NVMe
    - Tela Full HD 15.6"
    - Windows 11 Pro`,
  price: 4599.90,
  image: "https://firebasestorage.googleapis.com/v0/b/vibromakmkt-v3.appspot.com/o/products%2Fdell-inspiron-15.jpg",
  specs: {
    "Processador": "Intel Core i7-1255U (12ª Geração)",
    "Memória RAM": "16GB DDR4 3200MHz",
    "Armazenamento": "SSD 512GB NVMe PCIe",
    "Tela": "15.6\" Full HD (1920 x 1080) Antirreflexo",
    "Sistema Operacional": "Windows 11 Pro",
    "Placa de Vídeo": "Intel Iris Xe Graphics",
    "Conectividade": "Wi-Fi 6 + Bluetooth 5.1",
    "Portas": "2x USB 3.2, 1x USB-C, 1x HDMI, 1x RJ-45",
    "Bateria": "4 células, 54Wh",
    "Peso": "1.65 kg",
    "Dimensões": "35.8 x 23.5 x 1.89 cm",
    "Garantia": "12 meses"
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

async function addSampleProduct() {
  try {
    const docRef = await addDoc(collection(db, 'products'), sampleProduct);
    console.log('Produto de teste criado com sucesso!');
    console.log('ID do produto:', docRef.id);
  } catch (error) {
    console.error('Erro ao criar produto de teste:', error);
  }
}

// Executar
addSampleProduct();
