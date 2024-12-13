import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA2YXEoJXR0DOsIwbOa6R75Ka07Buvls6k",
  authDomain: "vibromakmkt-v3.firebaseapp.com",
  projectId: "vibromakmkt-v3",
  storageBucket: "vibromakmkt-v3.firebasestorage.app",
  messagingSenderId: "414114999641",
  appId: "1:414114999641:web:77dbee137b9fb628bef048",
  measurementId: "G-1980MQ6TE3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const userId = 'L1WpnLR3DaRDGxN2QdXJEGLLjIP2';
const email = 'rafaelcsmarilia@gmail.com';
const password = 'admin123'; // substitua pela senha correta

async function setUserAsAdmin() {
  try {
    // Primeiro faz login
    await signInWithEmailAndPassword(auth, email, password);
    
    // Depois atualiza o documento
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
