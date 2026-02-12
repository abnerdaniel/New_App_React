import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useClientAuth } from '../context/ClientAuthContext';
import { ArrowLeft, ShoppingBag, Truck, CheckCircle, Package } from 'lucide-react';
import { AxiosError } from 'axios';

interface PedidoItem {
  id: number;
  nomeProduto: string;
  quantidade: number;
  precoVenda: number;
  adicionais?: { nome: string; precoVenda: number }[]; // Simplificado
}

interface Pedido {
  id: number;
  status: string;
  valorTotal: number;
  dataVenda: string;
  loja?: { 
      nome: string;
      permitirCancelamentoCliente?: boolean;
      statusMaximoCancelamento?: string;
  };
  sacola: PedidoItem[];
}

const statusSteps = [
  { status: 'Pendente', label: 'Recebido', icon: ShoppingBag },
  { status: 'Em Preparo', label: 'Preparando', icon: Package },
  { status: 'Pronto', label: 'Pronto', icon: CheckCircle }, // Opcional
  { status: 'Saiu para Entrega', label: 'Saiu para Entrega', icon: Truck },
  { status: 'Entregue', label: 'Entregue', icon: CheckCircle },
  { status: 'Cancelado', label: 'Cancelado', icon: CheckCircle, color: 'text-red-500' }
];

export function PedidoStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cliente } = useClientAuth(); // Get auth context
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadPedido = useCallback(async () => {
    try {
      const response = await api.get(`/pedidos/${id}`);
      setPedido(response.data);
    } catch (err) {
      console.error("Erro ao buscar pedido", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPedido();
    const interval = setInterval(loadPedido, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [loadPedido]);

  const handleCancelOrder = async () => {
      if (!motivoCancelamento.trim()) return alert("Informe o motivo.");
      if (!cliente) return;
      
      try {
          setCancelLoading(true);
          // Backend expects [FromBody] string, so we send a JSON string
          await api.patch(`/pedidos/${id}/cancelar-cliente?clienteId=${cliente.id}`, JSON.stringify(motivoCancelamento), {
              headers: { 'Content-Type': 'application/json' }
          });
          alert("Pedido cancelado com sucesso.");
          setIsCancelModalOpen(false);
          loadPedido();
      } catch (error) {
          console.error(error);
          const err = error as AxiosError<{ message: string }>;
          alert(err.response?.data?.message || "Erro ao cancelar.");
      } finally {
          setCancelLoading(false);
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-500 mb-4">Pedido não encontrado.</p>
        <button onClick={() => navigate('/')} className="text-red-600 font-bold hover:underline">
          Voltar para Início
        </button>
      </div>
    );
  }

  // Determine current step index
  // Simple logic mapping string status to index
  // Note: Backend statuses: "Aguardando Aceitação" (New), "Pendente" (Accepted?), "Em Preparo", "Pronto", "Saiu para Entrega", "Entregue", "Cancelado"
  // Adjust logic as needed.
  
  const getStepIndex = (status: string) => {
      if (status === 'Cancelado') return -1;
      if (status === 'Entregue') return 4;
      if (status === 'Saiu para Entrega') return 3;
      if (status === 'Pronto') return 2;
      if (status === 'Em Preparo') return 1;
      return 0; // Pendente / Aguardando
  };
  
  const currentStep = getStepIndex(pedido.status);
  const isCancelado = pedido.status === 'Cancelado';
  
  // Logic verify cancellation
  const canCancel = !isCancelado && pedido.loja?.permitirCancelamentoCliente && (
      currentStep <= getStepIndex(pedido.loja?.statusMaximoCancelamento || 'Pendente')
  );

  console.log("Pedido Debug:", {
      status: pedido.status,
      loja: pedido.loja,
      permitir: pedido.loja?.permitirCancelamentoCliente,
      maxStatus: pedido.loja?.statusMaximoCancelamento,
      currentStep,
      maxStep: getStepIndex(pedido.loja?.statusMaximoCancelamento || 'Pendente'),
      canCancel
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-lg text-gray-800">Pedido #{pedido.id}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
                {isCancelado ? 'Pedido Cancelado' : pedido.status}
            </h2>

            {/* Steps Visualizer */}
            {!isCancelado && (
                <div className="space-y-6">
                    {statusSteps.filter(s => s.status !== 'Cancelado').map((step, index) => {
                        const isActive = index <= currentStep;
                        const isCurrent = index === currentStep;
                        const StepIcon = step.icon;
                        
                        return (
                            <div key={step.status} className={`flex items-center gap-4 ${isActive ? 'text-red-600' : 'text-gray-300'}`}>
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2
                                    ${isActive ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white'}
                                `}>
                                    <StepIcon size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-semibold ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {step.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="text-xs text-red-600 animate-pulse">Em andamento</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {isCancelado && (
                <div className="text-center text-red-500 p-4 bg-red-50 rounded-xl">
                    <CheckCircle className="mx-auto mb-2 w-12 h-12" />
                    <p>Este pedido foi cancelado.</p>
                </div>
            )}
            
            {/* Cancel Button */}
             {canCancel && (
                <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full mt-6 border-2 border-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors"
                >
                    Cancelar Pedido
                </button>
            )}
        </div>
        
        {/* Cancel Modal */}
        {isCancelModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
                    <h3 className="text-xl font-bold mb-4">Cancelar Pedido?</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                        Conte-nos o motivo do cancelamento. Isso ajuda a loja a melhorar.
                    </p>
                    <textarea 
                        value={motivoCancelamento}
                        onChange={(e) => setMotivoCancelamento(e.target.value)}
                        placeholder="Ex: Demorou muito, pedi errado..."
                        className="w-full border border-gray-300 rounded-lg p-3 h-24 mb-4 focus:ring-2 focus:ring-red-600 focus:outline-none resize-none"
                    />
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsCancelModalOpen(false)}
                            className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                            disabled={cancelLoading}
                        >
                            Voltar
                        </button>
                        <button 
                            onClick={handleCancelOrder}
                            disabled={cancelLoading}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
                        >
                            {cancelLoading ? 'Cancelando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-gray-400" />
                Resumo do Pedido
            </h3>
            
            <div className="space-y-4 divide-y divide-gray-100">
                {pedido.sacola.map((item, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 flex justify-between">
                        <div>
                            <p className="text-gray-800 font-medium">
                                <span className="text-red-600 font-bold mr-2">{item.quantidade}x</span>
                                {item.nomeProduto}
                            </p>
                            {/* Adicionais can be listed here if available in API response detalhada */}
                        </div>
                        <p className="text-gray-600 font-medium">
                            {(item.precoVenda * item.quantidade / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                ))}
            </div>
            
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-xl text-red-600">
                    {(pedido.valorTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
        </div>
        
        <div className="text-center text-gray-400 text-sm">
            <p>{new Date(pedido.dataVenda).toLocaleString('pt-BR')}</p>
            {pedido.loja && <p className="mt-1">{pedido.loja.nome}</p>}
        </div>

      </main>
    </div>
  );
}
