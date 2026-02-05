import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

export function StoreList() {
  const { user, selectLoja } = useAuth();
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLojas();
    }
  }, [user]);

  async function loadLojas() {
    try {
      const response = await api.get(`/api/loja/usuario/${user?.id}`);
      setLojas(response.data);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(lojaId: string) {
    selectLoja(lojaId);
    alert("Loja selecionada com sucesso!");
    navigate("/dashboard");
  }

  function handleEdit(loja: any) {
    // Redireciona para setup para editar, passando o estado ou ID via query param se necessário
    // No momento o SetupCompany pega a "loja atual do contexto" ou a primeira.
    // Para edição específica, precisaremos ajustar o SetupCompany para aceitar ID ou melhorar a lógica.
    // Por enquanto, vamos selecionar a loja e ir para o setup.
    selectLoja(loja.id);
    navigate("/setup");
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gerenciar Lojas</h2>
        <button 
            onClick={() => navigate('/setup', { state: { mode: 'create' } })}
            style={{ padding: "10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
            Nova Loja
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {lojas.map(loja => (
            <div key={loja.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{loja.nome}</h3>
                <p style={{ margin: 0, color: '#666' }}>{loja.cidade} - {loja.estado}</p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>CNPJ: {loja.cpfCnpj}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleSelect(loja.id)} style={{ padding: "8px", cursor: "pointer" }}>Selecionar</button>
                <button onClick={() => handleEdit(loja)} style={{ padding: "8px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>Editar</button>
              </div>
            </div>
          ))}
          {lojas.length === 0 && <p>Nenhuma loja encontrada.</p>}
        </div>
      )}
    </div>
  );
}
