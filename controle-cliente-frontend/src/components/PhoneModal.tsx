import { useState, useEffect } from 'react';
import { Phone, User, Check } from 'lucide-react';
import { useClientAuth } from '../context/ClientAuthContext';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PhoneModal({ isOpen, onClose, onSuccess }: PhoneModalProps) {
  const { cliente, updateProfile } = useClientAuth();
  
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && cliente) {
        setNome(cliente.nome || '');
        setTelefone(cliente.telefone || '');
    }
  }, [isOpen, cliente]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefone) {
        alert("Por favor, informe seu telefone.");
        return;
    }
    
    setLoading(true);
    try {
        await updateProfile({ nome, telefone });
        onSuccess();
        onClose();
    } catch (error) {
        console.error("Erro ao atualizar perfil", error);
        alert("Não foi possível salvar os dados. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        <div className="bg-brand-primary p-6 text-white text-center">
            <h2 className="text-xl font-bold">Complete seu Cadastro</h2>
            <p className="text-sm opacity-90 mt-1">Para finalizar o pedido, precisamos do seu telefone para contato.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Celular / WhatsApp <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 2) {
                        setTelefone(value);
                      } else if (value.length <= 7) {
                        setTelefone(`(${value.substring(0, 2)}) ${value.substring(2)}`);
                      } else {
                        setTelefone(`(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`);
                      }
                    }}
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    placeholder="(99) 99999-9999"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Salvando...' : (
                        <>
                            <Check size={20} />
                            Salvar e Continuar
                        </>
                    )}
                </button>
              </div>
        </form>
      </div>
    </div>
  );
}
