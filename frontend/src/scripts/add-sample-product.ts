import { productService } from '../services/productService';
import { sampleProduct } from '../test-data/sample-product';

async function addSampleProduct() {
  try {
    const productId = await productService.create(sampleProduct);
    console.log('Produto de teste criado com sucesso!');
    console.log('ID do produto:', productId);
    
    // Buscar o produto criado para confirmar
    const product = await productService.getById(productId);
    console.log('Dados do produto:', product);
  } catch (error) {
    console.error('Erro ao criar produto de teste:', error);
  }
}

// Executar
addSampleProduct();
