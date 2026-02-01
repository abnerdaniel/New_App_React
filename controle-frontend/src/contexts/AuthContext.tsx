import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario, AuthResponse } from '../types/Usuario';

interface AuthContextData {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recupera os dados do localStorage ao carregar
    const storedToken = localStorage.getItem('@App:token');
    const storedUser = localStorage.getItem('@App:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = (authData: AuthResponse) => {
    const userData: Usuario = {
      id: authData.id,
      nome: authData.nome,
      email: authData.email,
      lojas: authData.lojas,
      funcionarios: authData.funcionarios
    };

    setUser(userData);
    setToken(authData.token);

    localStorage.setItem('@App:token', authData.token);
    localStorage.setItem('@App:user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('@App:token');
    localStorage.removeItem('@App:user');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
