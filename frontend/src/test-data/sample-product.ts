import { Product } from '../services/productService';

export const sampleProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
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
  image: "https://firebasestorage.googleapis.com/v0/b/sistema-vendas-b31c9.appspot.com/o/products%2Fdell-inspiron-15.jpg",
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
  }
};
