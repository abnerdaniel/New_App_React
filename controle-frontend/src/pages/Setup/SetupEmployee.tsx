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

interface FuncionarioDTO {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  lojaId: string;
  ativo: boolean;
  dataCriacao: string;
}

export function SetupEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [employees, setEmployees] = useState<FuncionarioDTO[]>([]);
  const [selectedLojaId, setSelectedLojaId] = useState<string>("");

  // Form State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    login: "",
    password: "",
    cargo: "",
    lojaId: ""
  });

  // 1. Load Initial Data (Lojas & Cargos)
  useEffect(() => {
    if (user) {
        setLoading(true);
        Promise.all([
            api.get("/api/cargos"),
            api.get(`/api/loja/usuario/${user.id}`)
        ])
        .then(([resCargos, resLojas]) => {
            setCargos(resCargos.data);
            setLojas(resLojas.data);
            
            // AutoSelect Store if only one
            if (resLojas.data.length > 0) {
               // Default to first store for the Filter
               setSelectedLojaId(resLojas.data[0].id);
            }
        })
        .catch(err => console.error("Erro ao carregar dados iniciais", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // 2. Load Employees when Store Filter Changes
  useEffect(() => {
    if (selectedLojaId) {
        loadEmployees(selectedLojaId);
    } else {
        setEmployees([]);
    }
  }, [selectedLojaId, viewMode]); // Reload when view changes back to list

  const loadEmployees = async (lojaId: string) => {
    setLoading(true);
    try {
        const response = await api.get(`/api/funcionarios/loja/${lojaId}`);
        setEmployees(response.data);
    } catch (err) {
        console.error("Erro ao carregar equipe:", err);
    } finally {
        setLoading(false);
    }
  };

  const generateEmail = (nome: string, lojaId: string) => {
    if (!nome || !lojaId) return "";
    const loja = lojas.find(l => l.id === lojaId);
    if (!loja) return "";
    const cleanNome = nome.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, ''); 
    const cleanEmpresa = loja.nome.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanNome}@${cleanEmpresa}.com`;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        // Auto-fill Email logic
        if (name === 'nome' || name === 'lojaId') {
            const currentLojaId = name === 'lojaId' ? value : prev.lojaId;
            const currentNome = name === 'nome' ? value : prev.nome;
            if (currentNome && currentLojaId) {
                 const generated = generateEmail(currentNome, currentLojaId);
                 if (generated) newData.email = generated;
            }
        }
        return newData;
    });
  };

  const handleBlock = async (id: number, currentStatus: boolean) => {
      const action = currentStatus ? "bloquear" : "desbloquear";
      const confirmMsg = currentStatus 
        ? "Tem certeza que deseja bloquear este funcionário?" 
        : "Tem certeza que deseja desbloquear este funcionário?";

      if (!window.confirm(confirmMsg)) return;

      try {
          if (currentStatus) {
              await api.put(`/api/funcionarios/${id}/bloquear`);
              alert("Funcionário bloqueado com sucesso.");
          } else {
              await api.put(`/api/funcionarios/${id}/desbloquear`);
              alert("Funcionário desbloqueado com sucesso.");
          }
          loadEmployees(selectedLojaId); // Refresh list
      } catch (error) {
          console.error(`Erro ao ${action}:`, error);
          alert(`Erro ao ${action} funcionário.`);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    let finalLojaId = formData.lojaId;
    if (!finalLojaId && lojas.length === 1) finalLojaId = lojas[0].id;

    if (!finalLojaId) {
      setError("Selecione uma loja.");
      setLoading(false);
      return;
    }

    let emailToSend = formData.email;
    if (!emailToSend) {
        emailToSend = generateEmail(formData.nome, finalLojaId);
    }

    try {
      await api.post("/api/funcionarios", {
        ...formData,
        lojaId: finalLojaId,
        email: emailToSend
      });
      
      setSuccess("Funcionário cadastrado com sucesso!");
      // Reset form
      setFormData({
        nome: "",
        email: "",
        login: "",
        password: "",
        cargo: "",
        lojaId: "" 
      });
      // Delay to show success msg then switch view
      setTimeout(() => {
          setViewMode('list');
          setSuccess("");
      }, 1500);

    } catch (err: any) {
      console.error("Erro detalhado:", err.response?.data);
      let msg = "Erro ao cadastrar funcionário.";
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.data?.errors) msg = Object.values(err.response.data.errors).flat().join("\n");
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">
                    {viewMode === 'list' ? 'Gerenciar Equipe' : 'Novo Funcionário'}
                </h2>
                <p className="text-gray-500 mt-1">
                    {viewMode === 'list' 
                        ? 'Visualize e gerencie os membros da sua equipe.' 
                        : 'Preencha os dados para adicionar um membro.'}
                </p>
            </div>
            
            {viewMode === 'list' && (
                <button 
                    onClick={() => {
                        setFormData({ nome: "", email: "", login: "", password: "", cargo: "", lojaId: selectedLojaId });
                        setViewMode('create');
                    }}
                    className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-brand-hover transition-all flex items-center gap-2"
                >
                    <span>+</span> Novo Funcionário
                </button>
            )}
            
            {viewMode === 'create' && (
                <button 
                    onClick={() => setViewMode('list')}
                    className="bg-white text-gray-600 px-6 py-3 rounded-lg font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                >
                    Voltar para Lista
                </button>
            )}
        </div>

        {/* View: LIST */}
        {viewMode === 'list' && (
            <div className="space-y-6">
                
                {/* Store Filter */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <label className="font-semibold text-gray-700">Filtrar por Loja:</label>
                    <select 
                        value={selectedLojaId}
                        onChange={(e) => setSelectedLojaId(e.target.value)}
                        className="h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    >
                        <option value="">Selecione uma loja...</option>
                        {lojas.map(loja => (
                            <option key={loja.id} value={loja.id}>{loja.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cargo</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        Nenhum funcionário encontrado nesta loja.
                                    </td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800">{emp.nome}</td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                                                {emp.cargo}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
                                            {new Date(emp.dataCriacao).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${emp.ativo ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                {emp.ativo ? 'Ativo' : 'Bloqueado'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleBlock(emp.id, emp.ativo)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${
                                                    emp.ativo 
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                            >
                                                {emp.ativo ? 'Bloquear' : 'Ativar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* View: CREATE FORM */}
        {viewMode === 'create' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 border border-green-100 text-sm">{success}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Loja</label>
                            <select 
                                name="lojaId" 
                                value={formData.lojaId} 
                                onChange={handleFormChange} 
                                required
                                className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            >
                                <option value="">Selecione...</option>
                                {lojas.map(loja => (
                                    <option key={loja.id} value={loja.id}>{loja.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cargo</label>
                            <select 
                                name="cargo" 
                                value={formData.cargo} 
                                onChange={handleFormChange} 
                                required
                                className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            >
                                <option value="">Selecione...</option>
                                {cargos.map(cargo => (
                                    <option key={cargo.id} value={cargo.nome}>{cargo.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome Completo</label>
                        <input name="nome" value={formData.nome} onChange={handleFormChange} required className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="Ex: Maria Silva" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email (Automático)</label>
                        <input name="email" type="email" value={formData.email} onChange={handleFormChange} className="h-12 px-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="maria@loja.com" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Login</label>
                            <input name="login" value={formData.login} onChange={handleFormChange} required className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="usuario.acesso" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Senha Inicial</label>
                            <input name="password" type="password" value={formData.password} onChange={handleFormChange} required className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="******" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="submit" disabled={loading} className="flex-1 h-12 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-hover shadow-md transition-all active:scale-[0.98]">
                            {loading ? "Salvando..." : "Salvar Funcionário"}
                        </button>
                    </div>
                </form>
            </div>
        )}
      </div>
    </div>
  );
}
