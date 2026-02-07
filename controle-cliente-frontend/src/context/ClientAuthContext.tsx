import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

interface ClientUser {
  id: number;
  nome: string;
  email: string;
  token: string;
}

interface ClientAuthContextData {
  cliente: ClientUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const ClientAuthContext = createContext<ClientAuthContextData>({} as ClientAuthContextData);

export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cliente, setCliente] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedToken = localStorage.getItem('@App:clientToken');
    const storagedUser = localStorage.getItem('@App:clientUser');

    if (storagedToken && storagedUser) {
      api.defaults.headers.Authorization = `Bearer ${storagedToken}`;
      setCliente(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/clientes/login', { email, password });
    const { token, id, nome } = response.data;

    const user = { id, nome, email, token };

    localStorage.setItem('@App:clientToken', token);
    localStorage.setItem('@App:clientUser', JSON.stringify(user));

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setCliente(user);
  };

  const register = async (data: any) => {
    const response = await api.post('/clientes/cadastro', data);
    const { token, id, nome, email } = response.data;

    const user = { id, nome, email, token };

    localStorage.setItem('@App:clientToken', token);
    localStorage.setItem('@App:clientUser', JSON.stringify(user));

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setCliente(user);
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await api.post('/clientes/google-login', { idToken });
    const { token, id, nome, email } = response.data;

    const user = { id, nome, email, token };

    localStorage.setItem('@App:clientToken', token);
    localStorage.setItem('@App:clientUser', JSON.stringify(user));

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setCliente(user);
  };

  const logout = () => {
    localStorage.removeItem('@App:clientToken');
    localStorage.removeItem('@App:clientUser');
    api.defaults.headers.Authorization = null;
    setCliente(null);
  };

  return (
    <ClientAuthContext.Provider value={{ cliente, loading, login, register, loginWithGoogle, logout, isAuthenticated: !!cliente }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  return context;
}
