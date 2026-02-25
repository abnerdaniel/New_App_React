import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

export function PedidoSucesso() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-600 w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido Realizado!</h1>
        <p className="text-gray-600 mb-6">
          Seu pedido <span className="font-bold">#{id}</span> foi recebido com sucesso e logo será preparado.
        </p>

        <div className="space-y-3 flex flex-col-reverse relative">
          <button 
            onClick={() => {
                const lojaId = localStorage.getItem('lojaId'); 
                const lojaSlug = localStorage.getItem('lojaSlug');

                // Fallback priorities: Slug > ID > Home
                if (lojaSlug) navigate(`/${lojaSlug}`);
                else if (lojaId) navigate(`/${lojaId}`);
                else navigate('/');
            }}
            className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mt-3"
          >
            <Home size={20} />
            Voltar para a Loja
          </button>
          
          <button 
            onClick={() => navigate(`/pedido/${id}`)}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Acompanhar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
