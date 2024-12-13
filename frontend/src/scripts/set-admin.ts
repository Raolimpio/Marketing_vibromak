import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const userId = 'L1WpnLR3DaRDGxN2QdXJEGLLjIP2';

async function setUserAsAdmin() {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin: true,
      role: 'admin'
    });
    console.log('Usuário atualizado com sucesso como admin!');
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
  }
}

setUserAsAdmin();
