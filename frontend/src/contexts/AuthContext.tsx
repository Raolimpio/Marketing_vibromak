import { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updatePassword
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import { AuthContextType, UserProfile } from '../types/Auth';

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
  loading: true
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      if (user) {
        try {
          // Carregar perfil do usuário do Firebase
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          let profile: UserProfile | null = null;
          if (userDoc.exists()) {
            profile = userDoc.data() as UserProfile;
            setIsAdmin(profile.isAdmin || false);
            console.log('User profile loaded:', profile);
          } else {
            // Se o perfil não existir, criar um novo
            profile = {
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || '',
              role: 'user',
              isAdmin: false,
              createdAt: new Date()
            };
            await setDoc(doc(db, 'users', user.uid), profile);
            console.log('New user profile created:', profile);
          }
          setUserProfile(profile);

          // Sincronizar com o novo serviço de autenticação
          if (authService.isAuthenticated()) {
            const customProfile = await authService.getCurrentUser();
            if (customProfile && (customProfile.email !== profile.email || customProfile.isAdmin !== profile.isAdmin)) {
              await authService.updateProfile({
                email: profile.email,
                name: profile.name,
                role: profile.role,
                isAdmin: profile.isAdmin
              });
            }
          }
          await notificationService.init();
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        // Fazer logout também no novo serviço
        if (authService.isAuthenticated()) {
          await authService.logout();
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Primeiro tentar login no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Se o login for bem sucedido, buscar/atualizar dados no Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Se não existir no Firestore, criar o documento
        const newUserProfile = {
          email: email,
          name: email.split('@')[0],
          role: 'user',
          isAdmin: false,
          password: password,
          createdAt: new Date()
        };
        
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, newUserProfile);
        
        setUserProfile(newUserProfile);
        setIsAdmin(false);
      } else {
        // Se existir, atualizar a senha e o último login
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        await updateDoc(doc(db, 'users', userDoc.id), {
          password: password,
          lastLogin: new Date()
        });

        const profile = {
          id: userDoc.id,
          ...userData
        } as UserProfile;

        setUserProfile(profile);
        setIsAdmin(profile.isAdmin || false);
      }

      return userCredential.user;
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Usuário não encontrado');
      } else {
        throw new Error('Erro ao fazer login. Por favor, tente novamente.');
      }
    }
  };

  const logout = async () => {
    try {
      // Logout do Firebase
      await signOut(auth);
      setUserProfile(null);
      setIsAdmin(false);
      // Logout do novo serviço
      if (authService.isAuthenticated()) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAdmin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
