import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario, AuthResponse, LojaResumo, FuncionarioResumo } from '../types/Usuario';

interface AuthContextData {
  user: Usuario | null;
  token: string | null;
  activeLoja: LojaResumo | null;
  activeFuncionario: FuncionarioResumo | null;
  loading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  selectLoja: (lojaId: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeLoja, setActiveLoja] = useState<LojaResumo | null>(null);
  const [activeFuncionario, setActiveFuncionario] = useState<FuncionarioResumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@App:token');
    const storedUser = localStorage.getItem('@App:user');
    const storedLoja = localStorage.getItem('@App:activeLoja');
    const storedFuncionario = localStorage.getItem('@App:activeFuncionario');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      if (storedLoja) setActiveLoja(JSON.parse(storedLoja));
      if (storedFuncionario) setActiveFuncionario(JSON.parse(storedFuncionario));
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
    
    // Lógica de auto-seleção da Loja
    let selectedLoja: LojaResumo | null = null;
    let selectedFuncionario: FuncionarioResumo | null = null;

    if (authData.lojas && authData.lojas.length > 0) {
      // 1. Tenta pegar a primeira loja
      selectedLoja = authData.lojas[0];
      
      // 2. Busca o funcionário correspondente a essa loja
      if (authData.funcionarios) {
        selectedFuncionario = authData.funcionarios.find(f => f.lojaId === selectedLoja?.id) || null;
      }
    }

    setActiveLoja(selectedLoja);
    setActiveFuncionario(selectedFuncionario);

    // Persistindo
    localStorage.setItem('@App:token', authData.token);
    localStorage.setItem('@App:user', JSON.stringify(userData));
    if (selectedLoja) localStorage.setItem('@App:activeLoja', JSON.stringify(selectedLoja));
    if (selectedFuncionario) localStorage.setItem('@App:activeFuncionario', JSON.stringify(selectedFuncionario));
  };

  const selectLoja = (lojaId: string) => {
    if (!user || !user.lojas) return;

    const novaLoja = user.lojas.find(l => l.id === lojaId);
    if (novaLoja) {
      setActiveLoja(novaLoja);
      const novoFuncionario = user.funcionarios?.find(f => f.lojaId === lojaId) || null;
      setActiveFuncionario(novoFuncionario);

      localStorage.setItem('@App:activeLoja', JSON.stringify(novaLoja));
      localStorage.setItem('@App:activeFuncionario', JSON.stringify(novoFuncionario || ""));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveLoja(null);
    setActiveFuncionario(null);

    localStorage.removeItem('@App:token');
    localStorage.removeItem('@App:user');
    localStorage.removeItem('@App:activeLoja');
    localStorage.removeItem('@App:activeFuncionario');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeLoja,
        activeFuncionario,
        loading,
        login,
        logout,
        selectLoja,
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
