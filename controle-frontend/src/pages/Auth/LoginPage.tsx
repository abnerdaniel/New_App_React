import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { useAuth } from "../../contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { GoogleLoginButton } from "../../components/GoogleLoginButton";
import { LayoutDashboard, UserPlus, MessageCircle, Globe } from "lucide-react";

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
    /* auth-page class + inline style: dual guarantee against global CSS overrides */
    <div
      className="auth-page min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0a0f1e' }}
    >
      {/* Atmospheric glow blobs */}
      <div style={{
        position: 'absolute', top: '-120px', left: '-80px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', right: '-60px',
        width: '450px', height: '450px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="relative w-full max-w-md z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}
          >
            <LayoutDashboard size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Controle Admin</h1>
          <p style={{ color: '#94a3b8' }} className="text-sm mt-1">Sistema de Gestão de Restaurante</p>
        </div>

        {/* Card — inline style is the guarantee */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}
        >
          {/* Tabs */}
          <div style={{ borderBottom: '1px solid #1f2937', display: 'flex' }}>
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              style={{
                flex: 1, padding: '1rem',
                fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: isLogin ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: isLogin ? '#fff' : '#64748b',
                borderBottom: isLogin ? '2px solid #3b82f6' : '2px solid transparent',
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              style={{
                flex: 1, padding: '1rem',
                fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: !isLogin ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: !isLogin ? '#fff' : '#64748b',
                borderBottom: !isLogin ? '2px solid #818cf8' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <UserPlus size={14} /> Criar Conta
            </button>
          </div>

          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Google */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLoginButton />
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#1f2937' }} />
              <span style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                ou continue com email
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#1f2937' }} />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(127,29,29,0.4)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', padding: '0.75rem', borderRadius: '0.75rem',
                fontSize: '0.875rem', textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            {isLogin
              ? <LoginForm onSubmit={handleLogin} loading={loading} />
              : <RegisterForm onSubmit={handleRegister} loading={loading} />
            }
          </div>
        </div>

        {/* Footer */}
        <div className="mt-7 text-center" style={{ fontSize: '0.75rem', color: '#374151' }}>
          <p>Desenvolvido por <span style={{ color: '#6b7280', fontWeight: 600 }}>Help me Here</span></p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
            <a href="https://wa.me/5521991680708" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4b5563', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#60a5fa')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
            >
              <MessageCircle size={12} /> (21) 99168-0708
            </a>
            <span style={{ color: '#1f2937' }}>|</span>
            <a href="http://www.helpmehere.com.br" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4b5563', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#60a5fa')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
            >
              <Globe size={12} /> helpmehere.com.br
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
