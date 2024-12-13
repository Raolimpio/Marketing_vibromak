import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUWZwxRYBWMHUXPDOOL_0QxDth_qX_EIg",
  authDomain: "sistema-vendas-5d4f6.firebaseapp.com",
  projectId: "sistema-vendas-5d4f6",
  storageBucket: "sistema-vendas-5d4f6.appspot.com",
  messagingSenderId: "1041726759907",
  appId: "1:1041726759907:web:f5c0c1f89eff9c5e8e7c18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
