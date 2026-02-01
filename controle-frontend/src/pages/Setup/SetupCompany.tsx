import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/axios";

export function SetupCompany() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<any>({
    nome: "",
    cpfCnpj: "",
    telefone: "",
    email: "",
    instagram: "",
    facebook: "",
    twitter: "",
    linkedIn: "",
    whatsApp: "",
    telegram: "",
    youTube: "",
    twitch: "",
    tikTok: "",
    // Endereço
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: ""
  });

  useEffect(() => {
    // Check if we are in "Create Mode" forced via navigation state
    const isCreateMode = location.state?.mode === 'create';

    if (!isCreateMode && user && user.lojas && user.lojas.length > 0) {
      // Load current store data for editing
      const lojaAtual = user.lojas[0];
      setFormData(prev => ({
        ...prev,
        nome: lojaAtual.nome === "Nova Loja" ? "" : lojaAtual.nome,
        // ... populate other fields if available in user.lojas (Address not yet in user context usually)
        email: user.email || ""
      }));
      // Note: Full store details (address) might need a separate fetch if not in AuthContext
      // But keeping simple for now.
    }
  }, [user, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));

    // Busca automática de CEP
    if (name === 'cep') {
      const cep = value.replace(/\D/g, "");
      if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
          .then(res => res.json())
          .then(data => {
            if (!data.erro) {
              setFormData((prev: any) => ({
                ...prev,
                logradouro: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf,
                complemento: data.complemento || prev.complemento
              }));
            }
          })
          .catch(err => console.error("Erro ao buscar CEP", err));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isCreateMode = location.state?.mode === 'create';
      const hasStore = !isCreateMode && user && user.lojas && user.lojas.length > 0;
      
      if (hasStore) {
        // Modo Edição (PUT)
        const lojaId = user.lojas![0].id;
        await api.put(`/api/loja/${lojaId}`, {
          ...formData,
          ativo: true
        });
      } else {
        // Modo Criação (POST)
        await api.post(`/api/loja`, {
            ...formData,
            usuarioId: user!.id,
            senha: "temp",
            ativo: true
        });
      }

      alert("Loja configurada com sucesso!");
      
      // Como alteramos dados estruturais (nova loja ou novo nome), idealmente recarregamos a página ou fazemos novo login silencioso.
      // Vamos redirecionar para login para forçar recarga dos dados do usuário (token novo com claims novas se precisasse)
      // Ou navegar para dashboard e torcer para o AuthContext se virar.
      // Melhor: Navegar para dashboard. O AuthContext já tem a loja? Não, se foi criada agora, não tem.
      // Se foi criada agora, o user.lojas está vazio.
      // O ideal seria fazer um 'refreshUser'.
      
      navigate("/pessoas"); 
      window.location.reload(); // Força recarga para pegar os novos dados da API (vai fazer o restoreUser)

    } catch (err: any) {
      console.error("Erro no setup:", err);
      setError("Erro ao salvar dados da empresa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-background p-6 flex flex-col items-center">
      <div className="bg-surface w-full max-w-2xl p-8 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-brand-primary mb-2">Complete o Cadastro da Sua Empresa</h1>
        <p className="text-center text-text-muted mb-8">Precisamos de alguns detalhes para configurar sua loja.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-text-dark mb-1">Nome da Empresa *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Minha Loja Inc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">CPF ou CNPJ *</label>
              <input
                type="text"
                name="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={handleChange}
                required
                placeholder="00.000.000/0000-00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-text-dark mb-1">CEP</label>
                <input 
                  name="cep" 
                  value={formData.cep || ''} 
                  onChange={handleChange} 
                  placeholder="00000-000"
                  maxLength={9} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-text-dark mb-1">Cidade</label>
                 <input 
                   name="cidade" 
                   value={formData.cidade || ''} 
                   onChange={handleChange} 
                   className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-gray-50"
                 />
              </div>
              <div className="md:col-span-1">
                 <label className="block text-sm font-medium text-text-dark mb-1">Estado</label>
                 <input 
                   name="estado" 
                   value={formData.estado || ''} 
                   onChange={handleChange} 
                   className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-gray-50"
                 />
              </div>
              <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-text-dark mb-1">Bairro</label>
                   <input 
                     name="bairro" 
                     value={formData.bairro || ''} 
                     onChange={handleChange} 
                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-gray-50"
                   />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-text-dark mb-1">Logradouro</label>
                 <input 
                   name="logradouro" 
                   value={formData.logradouro || ''} 
                   onChange={handleChange} 
                   className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-gray-50"
                 />
              </div>
               <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-text-dark mb-1">Número</label>
                  <input 
                    name="numero" 
                    value={formData.numero || ''} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                  />
               </div>
               <div className="md:col-span-3">
                   <label className="block text-sm font-medium text-text-dark mb-1">Complemento</label>
                   <input 
                     name="complemento" 
                     value={formData.complemento || ''} 
                     onChange={handleChange} 
                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                   />
               </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Redes Sociais</h3>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Instagram (Opcional)</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@sualoja"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-primary text-white p-4 rounded-lg font-bold text-lg hover:bg-brand-hover transition-colors shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Concluir Cadastro"}
          </button>
        </form>
      </div>
    </div>
  );
}
