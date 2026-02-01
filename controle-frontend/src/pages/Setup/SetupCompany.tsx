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
    instagram: ""
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
      if (!user || !user.lojas || user.lojas.length === 0) {
        throw new Error("Loja não encontrada para atualização.");
      }

      const lojaId = user.lojas[0].id;

      // Chama endpoint de atualização da loja
      await api.put(`/api/lojas/${lojaId}`, {
        ...formData,
        ativo: true
      });

      // Atualiza o contexto do usuário recarregando dados ou manipulando o objeto local
      // Como o endpoint de PUT retorna a loja, idealmente precisaríamos atualizar o auth.
      // Por simplificação, vamos apenas redirecionar para o dashboard, assumindo que o nome atualizou no backend.
      // E para refletir no frontend agora, podemos forçar um reload ou atualizar o estado local se tivéssemos um metodo 'updateUser'.
      
      // Vamos navegar para home
      alert("Loja configurada com sucesso!");
      navigate("/pessoas"); 
      
      // Nota: O ideal seria ter um endpoint /me que retorna o usuário atualizado e chamar login(novoUser)
      // Mas para o MVP, o redirect funciona. O nome antigo pode persistir no context até o próximo login/refresh.

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
