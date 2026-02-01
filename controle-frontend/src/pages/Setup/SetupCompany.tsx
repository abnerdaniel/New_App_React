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
    setFormData(prev => ({ ...prev, [name]: value }));
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
    <div className="setup-container" style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Complete o Cadastro da Sua Empresa</h1>
      <p>Precisamos de alguns detalhes para configurar sua loja.</p>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>Nome da Empresa *</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Ex: Minha Loja Inc."
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>CPF ou CNPJ *</label>
          <input
            type="text"
            name="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={handleChange}
            required
            placeholder="00.000.000/0000-00"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Telefone / WhatsApp</label>
          <input
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <h3>Endereço</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
                <label>CEP</label>
                <input name="cep" value={formData.cep || ''} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
            </div>
            <div>
                <label>Cidade</label>
                <input name="cidade" value={formData.cidade || ''} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
            </div>
            <div>
                <label>Estado</label>
                <input name="estado" value={formData.estado || ''} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
            </div>
            <div>
                <label>Bairro</label>
                <input name="bairro" value={formData.bairro || ''} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
            </div>
        </div>
         <div>
            <label>Logradouro (Rua, Av...)</label>
            <input name="logradouro" value={formData.logradouro || ''} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '10px' }}>
            <div>
                <label>Número</label>
                <input name="numero" value={formData.numero || ''} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
            </div>
             <div>
                <label>Complemento</label>
                <input name="complemento" value={formData.complemento || ''} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
            </div>
        </div>

        <h3>Redes Sociais</h3>

        <div>
          <label>Instagram (Opcional)</label>
          <input
            type="text"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="@sualoja"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Salvando..." : "Concluir Cadastro"}
        </button>
      </form>
    </div>
  );
}
