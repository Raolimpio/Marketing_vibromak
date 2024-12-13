import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const userId = 'L1WpnLR3DaRDGxN2QdXJEGLLjIP2';

async function checkUserAdmin() {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('Dados do usuário:', userDoc.data());
    } else {
      console.log('Usuário não encontrado!');
    }
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
  }
}

checkUserAdmin();
