import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { auth } from '../config/firebase';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  menuColor: string;
  backgroundColor: string;
  textColor: string;
  logo?: string;
  buttonRadius: number;
  cardRadius: number;
  cardShadow: 'light' | 'medium' | 'strong';
  successColor: string;
  errorColor: string;
  warningColor: string;
  tableBorder: boolean;
  tableStriped: boolean;
  menuSelected: string;
  menuHover: string;
}

export const uploadLogo = async (file: File): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Usuário não autenticado');

  const storageRef = ref(storage, `public/logos/${file.name}`);
  await uploadBytes(storageRef, file);
  const logoUrl = await getDownloadURL(storageRef);
  
  await setDoc(doc(db, 'public', 'theme'), {
    logo: logoUrl,
    updatedAt: new Date(),
    updatedBy: currentUser.uid
  }, { merge: true });

  return logoUrl;
};

export const saveThemeSettings = async (settings: ThemeSettings) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Usuário não autenticado');

  // Salvar no Firestore
  await setDoc(doc(db, 'public', 'theme'), {
    ...settings,
    updatedAt: new Date(),
    updatedBy: currentUser.uid,
  });

  // Atualizar o cache local
  localStorage.setItem('appTheme', JSON.stringify(settings));

  // Força o recarregamento da página para aplicar o novo tema
  window.location.reload();
};

export const getThemeSettings = async (): Promise<ThemeSettings | null> => {
  try {
    // Tentar carregar o tema do localStorage primeiro
    const cachedTheme = localStorage.getItem('appTheme');
    if (cachedTheme) {
      return JSON.parse(cachedTheme) as ThemeSettings;
    }

    // Se não houver cache, carregar do Firestore
    const themeDoc = await getDoc(doc(db, 'public', 'theme'));
    if (themeDoc.exists()) {
      const themeData = themeDoc.data() as ThemeSettings;
      // Salvar no localStorage para próximos acessos
      localStorage.setItem('appTheme', JSON.stringify(themeData));
      return themeData;
    }

    return null;
  } catch (error) {
    console.error('Erro ao carregar configurações do tema:', error);
    // Em caso de erro, tentar usar o cache
    const cachedTheme = localStorage.getItem('appTheme');
    if (cachedTheme) {
      return JSON.parse(cachedTheme) as ThemeSettings;
    }
    return null;
  }
};
