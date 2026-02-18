import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Dashboard() {
  const { activeFuncionario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect restricted Motoboys to their specific page
    const isMotoboyRestricted = activeFuncionario?.cargo?.toLowerCase().includes("entregador") && !activeFuncionario?.acessoSistemaCompleto;
    if (isMotoboyRestricted) {
        navigate('/minhas-entregas');
    }
  }, [activeFuncionario, navigate]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mt-2">Visão geral do sistema.</p>
    </div>
  );
}
