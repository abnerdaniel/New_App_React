import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (login: string, password: string) => void;
  loading: boolean;
}

const inputWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  height: '48px',
  padding: '0 16px',
  backgroundColor: '#0f172a',
  border: '1px solid #1e2d45',
  borderRadius: '12px',
  transition: 'border-color 0.2s',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  color: '#e2e8f0',
  outline: 'none',
  fontSize: '0.9rem',
  border: 'none',
};

export function LoginForm({ onSubmit, loading }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusField, setFocusField] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    onSubmit(email, password);
  }

  const focusedWrapper: React.CSSProperties = {
    ...inputWrapperStyle,
    border: '1px solid #3b82f6',
    boxShadow: '0 0 0 3px rgba(59,130,246,0.15)',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Email / Login */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Email ou usuário
        </label>
        <div style={focusField === 'email' ? focusedWrapper : inputWrapperStyle}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusField('email')}
            onBlur={() => setFocusField(null)}
            required
            disabled={loading}
            style={{ ...inputStyle, opacity: loading ? 0.5 : 1 }}
            placeholder="seu@email.com"
            autoFocus
          />
        </div>
      </div>

      {/* Senha */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Senha
          </label>
          <a href="#" style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 500, textDecoration: 'none' }}>
            Esqueceu?
          </a>
        </div>
        <div style={focusField === 'password' ? focusedWrapper : inputWrapperStyle}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusField('password')}
            onBlur={() => setFocusField(null)}
            required
            minLength={6}
            disabled={loading}
            style={{ ...inputStyle, opacity: loading ? 0.5 : 1 }}
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', height: '48px',
          background: loading ? '#1e40af' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
          color: '#fff', borderRadius: '12px',
          fontWeight: 700, fontSize: '0.9rem',
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
          transition: 'all 0.2s',
          marginTop: '4px'
        }}
      >
        {loading
          ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Entrando...</>
          : <>Entrar <ArrowRight size={16} /></>
        }
      </button>
    </form>
  );
}
