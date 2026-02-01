import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

interface Cargo {
  id: number;
  nome: string;
}

interface Loja {
  id: string;
  nome: string;
}

export function SetupEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    login: "",
    password: "",
    cargo: "",
    lojaId: ""
  });

  useEffect(() => {
    // Carregar cargos e lojas
    if (user) {
        Promise.all([
            api.get("/api/cargos"),
            api.get(`/api/loja/usuario/${user.id}`)
        ])
        .then(([resCargos, resLojas]) => {
            setCargos(resCargos.data);
            setLojas(resLojas.data);
            
            // Se tiver apenas uma loja, seleciona automaticamente
            if (resLojas.data.length === 1) {
                setFormData(prev => ({ ...prev, lojaId: resLojas.data[0].id }));
            }
        })
        .catch(err => console.error("Erro ao carregar dados", err));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.lojaId) {
      setError("Selecione uma loja.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/funcionarios", {
        ...formData,
        // lojaId já está no formData
      });
      
      setSuccess("Funcionário cadastrado com sucesso!");
      setFormData({
        nome: "",
        email: "",
        login: "",
        password: "",
        cargo: "",
        lojaId: lojas.length === 1 ? lojas[0].id : "" // Mantém se for unica
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

        <select 
          name="lojaId" 
          value={formData.lojaId} 
          onChange={handleChange} 
          required
          style={{ padding: "8px" }}
        >
          <option value="">Selecione a Loja</option>
          {lojas.map(loja => (
            <option key={loja.id} value={loja.id}>{loja.nome}</option>
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
