import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Link2, Copy, Check } from "lucide-react";

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
  login: string;
  cargo: string;
  lojaId: string;
  ativo: boolean;
  dataCriacao: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

function EmployeeLoginLinkCard() {
  const [copied, setCopied] = useState(false);
  const loginUrl = `${window.location.origin}/login-funcionario`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(loginUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = loginUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 shadow-lg">
      {/* Decorative blobs */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon + Text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0 bg-white/20 p-3 rounded-xl">
            <Link2 size={24} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">
              Link de Acesso dos Funcionários
            </p>
            <p className="text-white font-mono text-sm truncate">
              {loginUrl}
            </p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer shadow-md
            ${copied
              ? 'bg-green-400 text-green-900 scale-95'
              : 'bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-[1.03]'
            }`}
        >
          {copied ? (
            <><Check size={16} /> Copiado!</>
          ) : (
            <><Copy size={16} /> Copiar Link</>
          )}
        </button>
      </div>
    </div>
  );
}

export function SetupEmployee() {
  // Data State
  const { user, activeLoja } = useAuth();

  // View State
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [employees, setEmployees] = useState<FuncionarioDTO[]>([]);

  // Form State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    login: "",
    password: "",
    cargo: "",
    lojaId: "",
  });

  // 1. Load Initial Data (Lojas & Cargos)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [cargosRes, lojasRes] = await Promise.all([
          api.get("/api/cargos"),
          api.get(`/api/loja/usuario/${user?.id}`),
        ]);

        setCargos(cargosRes.data);
        setLojas(lojasRes.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error("Erro detalhado:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadInitialData();
    }
  }, [user]);

  // 2. Load Employees when Global Store (activeLoja) Changes
  useEffect(() => {
    if (activeLoja?.id) {
      loadEmployees(activeLoja.id);
    } else {
      setEmployees([]);
    }
  }, [activeLoja, viewMode]); // Reload when view changes back to list

  const loadEmployees = async (lojaId: string) => {
    setLoading(true);
    try {
      // console.log(`Loading employees for loja: ${lojaId}`);
      const response = await api.get(`/api/funcionarios/loja/${lojaId}`);
      // console.log('Employees loaded:', response.data);
      setEmployees(response.data);
    } catch (error) {
      console.error("Erro ao carregar equipe", error);
      // toast.error('Erro ao carregar lista de funcionários.'); // Assuming toast is available
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = (nome: string, lojaId: string) => {
    if (!nome || !lojaId) return "";
    const loja = lojas.find((l) => l.id === lojaId);
    if (!loja) return "";
    const cleanNome = nome
      .toLowerCase()
      .split(" ")[0]
      .replace(/[^a-z0-9]/g, "");
    const cleanEmpresa = loja.nome.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${cleanNome}@${cleanEmpresa}.com`;
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Auto-fill Email logic
      if (name === "nome" || name === "lojaId") {
        const currentLojaId = name === "lojaId" ? value : prev.lojaId;
        const currentNome = name === "nome" ? value : prev.nome;
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
      if (activeLoja?.id) loadEmployees(activeLoja.id); // Refresh list using activeLoja
    } catch (error) {
      console.error(`Erro ao ${action}:`, error);
      alert(`Erro ao ${action} funcionário.`);
    }
  };

  const handleEdit = (employee: FuncionarioDTO) => {
    setFormData({
      nome: employee.nome,
      email: employee.email,
      login: employee.login || "",
      password: "", // Password not edited here
      cargo: employee.cargo,
      lojaId: employee.lojaId,
    });
    setEditingId(employee.id);
    setViewMode("edit");
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.",
      )
    )
      return;
    try {
      await api.delete(`/api/funcionarios/${id}`);
      alert("Funcionário excluído com sucesso.");
      if (activeLoja?.id) loadEmployees(activeLoja.id);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir funcionário.");
    }
  };

  const openPasswordModal = (id: number) => {
    setEditingId(id);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!editingId || !newPassword) return;
    try {
      await api.put(`/api/funcionarios/${editingId}/senha`, {
        novaSenha: newPassword,
      });
      alert("Senha alterada com sucesso!");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha.");
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
      if (viewMode === "edit" && editingId) {
        // Update
        await api.put(`/api/funcionarios/${editingId}`, {
          nome: formData.nome,
          email: emailToSend,
          login: formData.login,
          cargo: formData.cargo,
          // Password not updated here
        });
        setSuccess("Funcionário atualizado com sucesso!");
      } else {
        // Create
        await api.post("/api/funcionarios", {
          ...formData,
          lojaId: finalLojaId,
          email: emailToSend,
        });
        setSuccess("Funcionário cadastrado com sucesso!");
      }

      // Reset form
      setFormData({
        nome: "",
        email: "",
        login: "",
        password: "",
        cargo: "",
        lojaId: "",
      });
      setEditingId(null);

      // Delay to show success msg then switch view
      setTimeout(() => {
        setViewMode("list");
        setSuccess("");
        if (activeLoja?.id) loadEmployees(activeLoja.id);
      }, 1500);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Erro detalhado:", err.response?.data);
      let msg = "Erro ao salvar funcionário.";
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.data?.errors)
        msg = Object.values(err.response.data.errors).flat().join("\n");

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
              {viewMode === "list"
                ? "Gerenciar Equipe"
                : viewMode === "create"
                  ? "Novo Funcionário"
                  : "Editar Funcionário"}
            </h2>
            <p className="text-gray-500 mt-1">
              {viewMode === "list"
                ? "Visualize e gerencie os membros da sua equipe."
                : viewMode === "create"
                  ? "Preencha os dados para adicionar um membro."
                  : "Atualize os dados do funcionário."}
            </p>
          </div>

          {viewMode === "list" && (
            <button
              onClick={() => {
                setFormData({
                  nome: "",
                  email: "",
                  login: "",
                  password: "",
                  cargo: "",
                  lojaId: activeLoja?.id || "",
                });
                setViewMode("create");
              }}
              className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-brand-hover transition-all flex items-center gap-2"
            >
              <span>+</span> Novo Funcionário
            </button>
          )}

          {(viewMode === "create" || viewMode === "edit") && (
            <button
              onClick={() => setViewMode("list")}
              className="bg-white text-gray-600 px-6 py-3 rounded-lg font-bold border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Voltar para Lista
            </button>
          )}
        </div>

        {/* View: LIST */}
        {viewMode === "list" && (
          <div className="space-y-6">
            {/* Employee Login Link Card */}
            <EmployeeLoginLinkCard />

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      Ações
                    </th>
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
                    employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 font-medium text-gray-800">
                          {emp.nome}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                            {emp.cargo}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {new Date(emp.dataCriacao).toLocaleDateString(
                            "pt-BR",
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold border ${emp.ativo ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}
                          >
                            {emp.ativo ? "Ativo" : "Bloqueado"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(emp)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => openPasswordModal(emp.id)}
                              className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                            >
                              Senha
                            </button>
                            <button
                              onClick={() => handleBlock(emp.id, emp.ativo)}
                              className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${
                                emp.ativo
                                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            >
                              {emp.ativo ? "Bloq." : "Ativar"}
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View: CREATE/EDIT FORM */}
        {(viewMode === "create" || viewMode === "edit") && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 border border-green-100 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Loja
                  </label>
                  <select
                    name="lojaId"
                    value={formData.lojaId}
                    onChange={handleFormChange}
                    required
                    className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="">Selecione...</option>
                    {lojas.map((loja) => (
                      <option key={loja.id} value={loja.id}>
                        {loja.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Cargo
                  </label>
                  <select
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleFormChange}
                    required
                    className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="">Selecione...</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id} value={cargo.nome}>
                        {cargo.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Nome Completo
                </label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleFormChange}
                  required
                  className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  placeholder="Ex: Maria Silva"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Email (Automático)
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="h-12 px-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  placeholder="maria@loja.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Login
                  </label>
                  <input
                    name="login"
                    value={formData.login}
                    onChange={handleFormChange}
                    required
                    className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    placeholder="usuario.acesso"
                  />
                </div>
                {viewMode === "create" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Senha Inicial
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      required
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      placeholder="******"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-hover shadow-md transition-all active:scale-[0.98]"
                >
                  {loading
                    ? "Salvando..."
                    : viewMode === "edit"
                      ? "Salvar Alterações"
                      : "Salvar Funcionário"}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">Alterar Senha</h3>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha"
                className="w-full border p-2 rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePassword}
                  className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-hover"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
