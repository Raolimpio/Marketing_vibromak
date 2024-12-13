import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBH07U72RtqARjXZRNL_3hJRHLEgwC8Xtk",
  authDomain: "sistema-vendas-1c05f.firebaseapp.com",
  projectId: "sistema-vendas-1c05f",
  storageBucket: "sistema-vendas-1c05f.appspot.com",
  messagingSenderId: "1048772560338",
  appId: "1:1048772560338:web:a5d8f56b2dd168ae095008"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
