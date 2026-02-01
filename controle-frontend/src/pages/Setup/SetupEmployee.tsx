import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

interface Cargo {
  id: number;
  nome: string;
}

export function SetupEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cargos, setCargos] = useState<Cargo[]>([]);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    login: "",
    password: "",
    cargo: "",
  });

  useEffect(() => {
    // Carregar cargos disponíveis
    api.get("/api/cargos")
      .then(response => setCargos(response.data))
      .catch(err => console.error("Erro ao carregar cargos", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!user || !user.lojas || user.lojas.length === 0) {
      setError("Nenhuma loja selecionada.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/funcionarios", {
        ...formData,
        lojaId: user.lojas[0].id // Usa a primeira loja do usuário logado (Dono)
      });
      
      setSuccess("Funcionário cadastrado com sucesso!");
      setFormData({
        nome: "",
        email: "",
        login: "",
        password: "",
        cargo: ""
      });

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao cadastrar funcionário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Cadastrar Novo Funcionário</h2>
      <p>Adicione membros à sua equipe.</p>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: "10px" }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        
        <input
          name="nome"
          placeholder="Nome Completo"
          value={formData.nome}
          onChange={handleChange}
          required
          style={{ padding: "8px" }}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: "8px" }}
        />

        <input
          name="login"
          placeholder="Login de Acesso"
          value={formData.login}
          onChange={handleChange}
          required
          style={{ padding: "8px" }}
        />

        <input
          name="password"
          type="password"
          placeholder="Senha Inicial"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: "8px" }}
        />

        <select 
          name="cargo" 
          value={formData.cargo} 
          onChange={handleChange} 
          required
          style={{ padding: "8px" }}
        >
          <option value="">Selecione um Cargo</option>
          {cargos.map(cargo => (
            <option key={cargo.id} value={cargo.nome}>{cargo.nome}</option>
          ))}
        </select>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Cadastrar" : "Concluir Cadastro"}
        </button>

        <button 
          type="button" 
          onClick={() => navigate("/dashboard")}
          style={{ padding: "10px", backgroundColor: "#ccc", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Voltar
        </button>
      </form>
    </div>
  );
}
