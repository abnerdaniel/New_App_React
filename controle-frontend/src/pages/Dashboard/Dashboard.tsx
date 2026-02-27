import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/axios';
import { AlertTriangle } from 'lucide-react';

// Components
import { MasterControl } from './components/MasterControl';
import { ShiftKPIs } from './components/ShiftKPIs';
import { OperationFunnel } from './components/OperationFunnel';
import { CriticalAlerts } from './components/CriticalAlerts';
import { DailyRanking } from './components/DailyRanking';

export function Dashboard() {
  const { activeFuncionario, activeLoja } = useAuth();
  const navigate = useNavigate();
  
  // Data States
  const [lojaData, setLojaData] = useState<any>(null); // Dados completos da loja (status, config)
  const [resumoDia, setResumoDia] = useState<any>(null);
  const [funil, setFunil] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Initial Data (Static/Config)
  const loadLojaData = useCallback(async () => {
       if (!activeLoja?.id) return;
       try {
           const res = await api.get(`/api/loja/${activeLoja.id}`);
           setLojaData(res.data);
       } catch (error) {
           console.error("Erro ao carregar dados da loja", error);
       }
  }, [activeLoja?.id]);

  // Load Real-time Data
  const loadRealTimeData = useCallback(async () => {
      if (!activeLoja?.id) return;
      
      try {
          const [resResumo, resFunil, resAlertas, resRanking] = await Promise.all([
              api.get(`/api/dashboard/loja/${activeLoja.id}/resumo`),
              api.get(`/api/dashboard/loja/${activeLoja.id}/funil`),
              api.get(`/api/dashboard/loja/${activeLoja.id}/alertas`),
              api.get(`/api/dashboard/loja/${activeLoja.id}/ranking`)
          ]);

          setResumoDia(resResumo.data);
          setFunil(resFunil.data);
          setAlertas(resAlertas.data);
          setRanking(resRanking.data);
      } catch (error) {
          console.error("Erro ao carregar dashboard", error);
      } finally {
          setLoading(false);
      }
  }, [activeLoja?.id]);

  useEffect(() => {
    // Redirect restricted Motoboys
    const isMotoboyRestricted = activeFuncionario?.cargo?.toLowerCase().includes("entregador") && !activeFuncionario?.acessoSistemaCompleto;
    if (isMotoboyRestricted) {
        navigate('/minhas-entregas');
        return;
    }

    if (activeLoja?.id) {
        loadLojaData();
        loadRealTimeData();

        // Polling para "Real Time" (30s)
        const interval = setInterval(loadRealTimeData, 30000);
        return () => clearInterval(interval);
    }
  }, [activeFuncionario, activeLoja, navigate, loadLojaData, loadRealTimeData]);

  if (loading && !resumoDia) {
      return <div className="p-8 text-center text-gray-500">Carregando painel de controle...</div>;
  }

  // Lógica da Licença
  let diasRestantes = null;
  let licencaExpirada = false;
  
  if (lojaData?.licencaValidaAte) {
      const msDia = 1000 * 60 * 60 * 24;
      const validade = new Date(lojaData.licencaValidaAte).getTime();
      const hoje = new Date().getTime();
      diasRestantes = Math.ceil((validade - hoje) / msDia);
      licencaExpirada = diasRestantes <= 0;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {lojaData?.bloqueadaPorFaltaDePagamento && (
          <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg mb-6 flex items-center gap-3 font-bold border-2 border-red-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                 <h3>LOJA BLOQUEADA!</h3>
                 <p className="text-sm font-normal">Sua loja foi bloqueada temporariamente. Entre em contato com o suporte ou envie o comprovante de pagamento.</p>
              </div>
          </div>
      )}

      {(!lojaData?.bloqueadaPorFaltaDePagamento && diasRestantes !== null && diasRestantes <= 5) && (
          <div className={`p-4 rounded-xl shadow-lg mb-6 flex items-center gap-3 font-bold border-2 ${licencaExpirada ? 'bg-red-100 text-red-800 border-red-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                 <h3>{licencaExpirada ? 'Sua licença expirou!' : `Sua licença expira em ${diasRestantes} dia(s)!`}</h3>
                 <p className="text-sm font-normal">Por favor, regularize o pagamento para evitar a suspensão da sua loja.</p>
              </div>
          </div>
      )}

      <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Painel de Controle</h1>
          <p className="text-gray-500 text-sm">Visão operacional em tempo real da {activeLoja?.nome}</p>
      </div>

      {/* 1. Controle Mestre */}
      <MasterControl loja={lojaData} onUpdate={loadLojaData} />

      {/* 2. KPIs do Turno */}
      <ShiftKPIs data={resumoDia} />

      {/* 3. Funil Operacional */}
      <OperationFunnel data={funil} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 4. Alertas Críticos */}
          <CriticalAlerts alertas={alertas} />

          {/* 5. Ranking do Dia */}
          <DailyRanking data={ranking} />
      </div>

    </div>
  );
}
