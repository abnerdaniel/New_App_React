import { createContext, useContext, useState, type ReactNode } from 'react';

import { type Mesa } from '../services/mesas';

interface WaiterContextData {
  isWaiterMode: boolean;
  mesaSelecionada: Mesa | null;
  entrarModoGarcom: () => void;
  sairModoGarcom: () => void;
  selecionarMesa: (mesa: Mesa | null) => void;
}

const WaiterContext = createContext<WaiterContextData>({} as WaiterContextData);

export function WaiterProvider({ children }: { children: ReactNode }) {
  const [isWaiterMode, setIsWaiterMode] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);

  const entrarModoGarcom = () => setIsWaiterMode(true);
  
  const sairModoGarcom = () => {
    setIsWaiterMode(false);
    setMesaSelecionada(null);
  };

  const selecionarMesa = (mesa: Mesa | null) => {
    setMesaSelecionada(mesa);
  };

  return (
    <WaiterContext.Provider value={{
      isWaiterMode,
      mesaSelecionada,
      entrarModoGarcom,
      sairModoGarcom,
      selecionarMesa
    }}>
      {children}
    </WaiterContext.Provider>
  );
}

export const useWaiter = () => useContext(WaiterContext);
