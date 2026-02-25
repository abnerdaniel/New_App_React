import { createContext, useContext, useState, type ReactNode } from 'react';
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
  updateActiveLoja: (dados: Partial<LojaResumo>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('@App:token'));
  
  const [user, setUser] = useState<Usuario | null>(() => {
      const storedUser = localStorage.getItem('@App:user');
      return storedUser ? JSON.parse(storedUser) : null;
  });

  const [activeLoja, setActiveLoja] = useState<LojaResumo | null>(() => {
      const storedLoja = localStorage.getItem('@App:activeLoja');
      return storedLoja ? JSON.parse(storedLoja) : null;
  });

  const [activeFuncionario, setActiveFuncionario] = useState<FuncionarioResumo | null>(() => {
      const storedFuncionario = localStorage.getItem('@App:activeFuncionario');
      return storedFuncionario ? JSON.parse(storedFuncionario) : null;
  });

  // Loading is no longer needed for init, but keeping it false to match interface if needed.
  // Actually, if we init synchronously, no loading needed.
  const [loading] = useState(false);

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

      
      // Async fetch to get the actual open/close status from the backend
      // Using a global or non-component fetch to avoid "export function" issues in Vite fast-refresh if any
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loja/${lojaId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
          if (data && data.abertaManualmente !== undefined) {
              const isAberta = data.abertaManualmente !== false;
              updateActiveLoja({ aberta: isAberta });
          }
      })
      .catch(err => console.error("Error fetching latest store status on switch", err));
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

  const updateActiveLoja = (dados: Partial<LojaResumo>) => {
      if (!activeLoja) return;
  
      const novaLoja = { ...activeLoja, ...dados };
      setActiveLoja(novaLoja);
      localStorage.setItem('@App:activeLoja', JSON.stringify(novaLoja));
      
      if (user && user.lojas) {
          const lojasAtualizadas = user.lojas.map(l => l.id === novaLoja.id ? novaLoja : l);
          const novoUser = { ...user, lojas: lojasAtualizadas };
          setUser(novoUser);
          localStorage.setItem('@App:user', JSON.stringify(novoUser));
      }
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
        updateActiveLoja,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
