import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (nome: string, email: string, password: string) => void;
  loading: boolean;
}

const inputWrapperStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  height: '44px', padding: '0 14px',
  backgroundColor: '#0f172a',
  border: '1px solid #1e2d45',
  borderRadius: '10px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
  width: '100%',
  minWidth: 0,
};

const focusedStyle: React.CSSProperties = {
  ...inputWrapperStyle,
  border: '1px solid #3b82f6',
  boxShadow: '0 0 0 3px rgba(59,130,246,0.15)',
};

const inputBase: React.CSSProperties = {
  flex: 1, background: 'transparent',
  color: '#e2e8f0', outline: 'none',
  fontSize: '0.875rem', border: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.68rem', fontWeight: 600,
  color: '#94a3b8', textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
};

function Field({ label, type, value, onChange, placeholder, focusKey, focusField, setFocusField, disabled }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  focusKey: string; focusField: string | null;
  setFocusField: (k: string | null) => void; disabled: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, width: '100%' }}>
      <label style={labelStyle}>{label}</label>
      <div style={focusField === focusKey ? focusedStyle : inputWrapperStyle}>
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocusField(focusKey)}
          onBlur={() => setFocusField(null)}
          required disabled={disabled}
          style={{ ...inputBase, opacity: disabled ? 0.5 : 1 }}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export function RegisterForm({ onSubmit, loading }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [focusField, setFocusField] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nome || !email || !password || !confirmPassword) {
      setError("Todos os campos são obrigatórios");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    onSubmit(nome, email, password);
  }

  const fieldProps = { focusField, setFocusField, disabled: loading };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
      {error && (
        <div style={{
          backgroundColor: 'rgba(127,29,29,0.4)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5', padding: '10px 14px', borderRadius: '10px',
          fontSize: '0.8rem', textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <Field label="Nome Completo" type="text" value={nome} onChange={setNome} placeholder="Seu nome completo" focusKey="nome" {...fieldProps} />
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" focusKey="email" {...fieldProps} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '12px', width: '100%', minWidth: 0 }}>
        <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="••••••" focusKey="pass" {...fieldProps} />
        <Field label="Confirmar" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••" focusKey="confirm" {...fieldProps} />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', height: '46px',
          background: loading ? '#312e81' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontWeight: 700, fontSize: '0.875rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 18px rgba(59,130,246,0.35)',
          transition: 'all 0.2s', marginTop: '4px',
        }}
      >
        {loading
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Criando conta...</>
          : <>Criar conta <ArrowRight size={15} /></>
        }
      </button>
    </form>
  );
}
