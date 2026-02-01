import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/axios";

export function SetupCompany() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    // Tenta carregar os dados da loja atual (pré-criada)
    if (user && user.lojas && user.lojas.length > 0) {
      const lojaAtual = user.lojas[0];
      setFormData(prev => ({
        ...prev,
        nome: lojaAtual.nome === "Nova Loja" ? "" : lojaAtual.nome, // Limpa se for o default
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const hasStore = user && user.lojas && user.lojas.length > 0;
      
      if (hasStore) {
        // Modo Edição (PUT)
        const lojaId = user.lojas![0].id; // Safe because hasStore is true
        await api.put(`/api/lojas/${lojaId}`, {
          ...formData,
          ativo: true
        });
      } else {
        // Modo Criação (POST)
        // Precisamos enviar alguns campos extras que o DTO pede
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
