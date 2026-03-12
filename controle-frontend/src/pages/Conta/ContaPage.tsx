import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { contaApi } from "../../api/conta.api";
import { User, Lock, Save, Loader2, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";

export function ContaPage() {
  const { user, updateUser } = useAuth();
  
  // Perfil State
  const [nome, setNome] = useState(user?.nome || "");
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [perfilSuccess, setPerfilSuccess] = useState(false);
  const [perfilError, setPerfilError] = useState("");

  // Senha State
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loadingSenha, setLoadingSenha] = useState(false);
  const [senhaSuccess, setSenhaSuccess] = useState(false);
  const [senhaError, setSenhaError] = useState("");

  useEffect(() => {
    if (user?.nome) {
      setNome(user.nome);
    }
  }, [user]);

  async function handleSalvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setPerfilError("");
    setPerfilSuccess(false);

    if (!nome.trim()) {
      setPerfilError("O nome não pode estar vazio.");
      return;
    }

    setLoadingPerfil(true);
    try {
      const updatedUser = await contaApi.atualizarPerfil({ nome });
      updateUser({ nome: updatedUser.nome });
      setPerfilSuccess(true);
      setTimeout(() => setPerfilSuccess(false), 3000);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setPerfilError(err.response?.data?.message || "Erro ao atualizar perfil.");
    } finally {
      setLoadingPerfil(false);
    }
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    setSenhaError("");
    setSenhaSuccess(false);

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSenhaError("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setSenhaError("As novas senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      setSenhaError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoadingSenha(true);
    try {
      await contaApi.alterarSenha({ senhaAtual, novaSenha });
      setSenhaSuccess(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(() => setSenhaSuccess(false), 3000);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setSenhaError(err.response?.data?.message || "Erro ao alterar senha.");
    } finally {
      setLoadingSenha(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
        <p className="text-gray-500 mt-1">Gerencie suas informações pessoais e configurações de segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna da esquerda - Dados básicos */}
        <div className="md:col-span-1 border border-gray-100 bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center h-fit">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold text-3xl mb-4">
                {user?.nome ? user.nome.substring(0,2).toUpperCase() : "U"}
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center">{user?.nome}</h2>
            <p className="text-gray-500 text-sm mt-1 mb-6 flex items-center gap-2">
                <LinkIcon size={14} /> {user?.email}
            </p>
            <div className="w-full h-px bg-gray-100 mb-6"></div>
            <div className="w-full text-left">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Detalhes da Conta</p>
                <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded-full">Ativa</span>
                </div>
            </div>
        </div>

        {/* Coluna da direita - Configurações */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card: Perfil */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Perfil</h3>
                <p className="text-sm text-gray-500">Atualize seu nome de exibição.</p>
              </div>
            </div>

            <form onSubmit={handleSalvarPerfil} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input 
                  type="email" 
                  value={user?.email || ""} 
                  disabled 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                />
              </div>

              {perfilError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {perfilError}
                </div>
              )}

              {perfilSuccess && (
                <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} /> Perfil atualizado com sucesso!
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={loadingPerfil}
                  className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-70"
                >
                  {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>

          {/* Card: Senha */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Segurança</h3>
                <p className="text-sm text-gray-500">Altere sua senha de acesso.</p>
              </div>
            </div>

            <form onSubmit={handleAlterarSenha} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                <input 
                  type="password" 
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Digite sua senha atual"
                  required
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                  <input 
                    type="password" 
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    minLength={6}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {senhaError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {senhaError}
                </div>
              )}

              {senhaSuccess && (
                <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} /> Senha alterada com sucesso!
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={loadingSenha}
                  className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70"
                >
                  {loadingSenha ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
