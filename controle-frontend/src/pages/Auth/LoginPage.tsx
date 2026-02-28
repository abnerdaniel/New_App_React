import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { useAuth } from "../../contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { GoogleLoginButton } from "../../components/GoogleLoginButton";
import { LayoutDashboard, UserPlus, MessageCircle, Globe } from "lucide-react";
import { ProductFeatures } from "./ProductFeatures";

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(loginData: string, password: string) {
    setLoading(true);
    setError("");
    try {
      const response = await authApi.login({ login: loginData, password });
      login(response);
      const isEmployee = response.funcionarios && response.funcionarios.length > 0;
      const hasStores = response.lojas.length > 0 && response.lojas[0].nome !== "Nova Loja";
      if (!hasStores && !isEmployee) navigate("/setup");
      else navigate("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(nome: string, email: string, password: string) {
    setLoading(true);
    setError("");
    try {
      const response = await authApi.register({ nome, email, password });
      login(response);
      navigate("/pessoas");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-background text-text-dark font-sans">
      {/* Esquerda: Informações do Produto (Feature Section) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-white border-r border-gray-200">
        <ProductFeatures />
        
        {/* Soft Background Accent */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(234,29,44,0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(234,29,44,0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Direita: Formulário de Login */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md relative z-10">
          
          <div className="text-center mb-10 lg:hidden">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-red-50"
              style={{ border: '1px solid #fee2e2' }}
            >
              <LayoutDashboard size={26} className="text-brand-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">MenuTech</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Gestão Inteligente</p>
          </div>

          <div
            className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 p-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
                  isLogin 
                    ? 'bg-white text-brand-primary border-brand-primary shadow-[0_2px_0_0_#EA1D2C]' 
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-gray-50'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 p-4 text-sm font-semibold transition-all duration-200 border-b-2 flex items-center justify-center gap-2 ${
                  !isLogin 
                    ? 'bg-white text-brand-primary border-brand-primary shadow-[0_2px_0_0_#EA1D2C]' 
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-gray-50'
                }`}
              >
                <UserPlus size={14} /> Criar Conta
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6">
              {/* Resumo visual quando em mobile se não houver feature text */}
              <div className="lg:hidden text-center text-sm font-medium text-slate-500 mb-2">
                Cardápio digital, gestão 360º, painel KDS e integrações (em breve).
              </div>

              <div className="flex justify-center">
                <GoogleLoginButton />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  ou use email
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-brand-primary p-3 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}

              {/* Form container resets the global form styles that might interfere */}
              <div className="[&>form]:shadow-none [&>form]:p-0 [&>form]:mb-0 [&>form]:bg-transparent">
                {isLogin ? (
                  <LoginForm onSubmit={handleLogin} loading={loading} />
                ) : (
                  <RegisterForm onSubmit={handleRegister} loading={loading} />
                )}
              </div>
            </div>
          </div>

          {/* Footer - Social Proof & Help */}
          <div className="mt-8 text-center text-xs font-medium text-slate-500">
            <p>Desenvolvido por <span className="text-slate-700 font-semibold">Help me Here</span></p>
            <div className="flex justify-center items-center gap-4 mt-3">
              <a href="https://wa.me/5521991680708" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
              >
                <MessageCircle size={14} /> (21) 99168-0708
              </a>
              <span className="text-gray-300">|</span>
              <a href="http://www.helpmehere.com.br" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
              >
                <Globe size={14} /> helpmehere.com.br
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
