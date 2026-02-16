import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { type Mesa } from '../services/mesas';

interface WaiterUser {
  nome: string;
}

interface WaiterContextData {
  isWaiterMode: boolean;
  waiterUser: WaiterUser | null;
  waiterLojaId: string | null;
  mesaSelecionada: Mesa | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selecionarMesa: (mesa: Mesa | null) => void;
  sairModoGarcom: () => void;
}

const WaiterContext = createContext<WaiterContextData>({} as WaiterContextData);

export function WaiterProvider({ children }: { children: ReactNode }) {
  const [isWaiterMode, setIsWaiterMode] = useState(false);
  const [waiterUser, setWaiterUser] = useState<WaiterUser | null>(null);
  const [waiterLojaId, setWaiterLojaId] = useState<string | null>(null);
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('waiterUser');
    const storedLojaId = localStorage.getItem('waiterLojaId');
    const storedToken = localStorage.getItem('waiterToken');

    if (storedUser && storedLojaId && storedToken) {
      setWaiterUser(JSON.parse(storedUser));
      setWaiterLojaId(storedLojaId);
      setIsWaiterMode(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
     // Hardcoded URL for now, or import from config
     const API_URL = 'http://localhost:5024'; 
     try {
         const response = await axios.post(`${API_URL}/api/auth/login`, { login: email, password });
         const data = response.data;
         
         console.log('Login Response:', data); // Debugging

         const token = data.token || data.Token;

         if (token) {
            localStorage.setItem('waiterToken', token);
            
            // Determine Loja (Case insensitive check)
            let selectedLojaId = '';
            
            const funcionarios = data.funcionarios || data.Funcionarios || [];
            const lojas = data.lojas || data.Lojas || [];

            if (funcionarios.length > 0) {
                const func = funcionarios[0];
                // Check for lojaId, LojaId, loja_id
                selectedLojaId = func.lojaId || func.LojaId || func.loja_id || '';
            } else if (lojas.length > 0) {
                 selectedLojaId = lojas[0].id || lojas[0].Id;
            }

            if (selectedLojaId) {
                localStorage.setItem('waiterLojaId', selectedLojaId);
                setWaiterLojaId(selectedLojaId);
                
                const nome = data.nome || data.Nome;
                const userObj = { nome };
                localStorage.setItem('waiterUser', JSON.stringify(userObj));
                setWaiterUser(userObj);
                
                setIsWaiterMode(true);
            } else {
                console.error('Dados de login incompletos (Loja não encontrada):', data);
                throw new Error('Usuário não vinculado a nenhuma loja/equipe. (LojaId não encontrado na resposta)');
            }
         }
     } catch (error: any) {
         console.error('Erro detalhado no login:', error.response?.data || error.message);
         throw error; // Re-throw to be handled by the UI
     }
  };

  const logout = () => {
    localStorage.removeItem('waiterToken');
    localStorage.removeItem('waiterLojaId');
    localStorage.removeItem('waiterUser');
    setWaiterUser(null);
    setWaiterLojaId(null);
    setIsWaiterMode(false);
    setMesaSelecionada(null);
  };

  const selecionarMesa = (mesa: Mesa | null) => {
    setMesaSelecionada(mesa);
  };

  const sairModoGarcom = () => {
      setMesaSelecionada(null);
  };

  return (
    <WaiterContext.Provider value={{
      isWaiterMode,
      waiterUser,
      waiterLojaId,
      mesaSelecionada,
      login,
      logout,
      selecionarMesa,
      sairModoGarcom
    }}>
      {children}
    </WaiterContext.Provider>
  );
}

export const useWaiter = () => useContext(WaiterContext);
