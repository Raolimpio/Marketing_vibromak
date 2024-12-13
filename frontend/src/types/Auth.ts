import { User } from 'firebase/auth';

export type QuoteStatus = 'sent' | 'negotiation' | 'won' | 'lost';

export interface QuoteStatusInfo {
  label: string;
  color: string;
  icon: string;
  nextStatuses: QuoteStatus[];
}

export interface UserProfile {
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
