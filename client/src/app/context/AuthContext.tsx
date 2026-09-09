import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role) {
          parsed.role = String(parsed.role).toUpperCase();
          setCurrentUser(parsed);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCurrentUser(data.user);
  };

  const register = async (
  name: string,
  email: string,
  password: string
): Promise<void> => {
  const data = await authService.register(name, email, password);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  setCurrentUser(data.user);
};

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
