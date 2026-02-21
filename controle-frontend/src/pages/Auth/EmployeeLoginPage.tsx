import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiter } from '../../contexts/WaiterContext';
import { ChefHat, User, Bike as BikeIcon, ArrowRight, Loader2, LayoutDashboard, LogOut } from 'lucide-react';

const PAGE_BG = '#0a0f1e';
const CARD_BG = '#111827';
const CARD_BORDER = '#1f2937';
const INPUT_BG = '#0f172a';
const INPUT_BORDER = '#1e2d45';
const INPUT_BORDER_FOCUS_ORANGE = '#ea580c';
const TEXT_MAIN = '#e2e8f0';
const TEXT_MUTED = '#94a3b8';
const TEXT_DIM = '#64748b';

export function EmployeeLoginPage() {
  const navigate = useNavigate();
  const { login, waiterUser, logout } = useWaiter();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginInput, password);
    } catch (err: unknown) {
      console.error(err);
      setError('Login falhou. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrapper = (field: string, focusColor: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    height: '48px', padding: '0 16px',
    backgroundColor: INPUT_BG,
    border: `1px solid ${focusField === field ? focusColor : INPUT_BORDER}`,
    borderRadius: '12px',
    boxShadow: focusField === field ? `0 0 0 3px ${focusColor}26` : 'none',
    transition: 'all 0.2s',
  });

  const inputBase: React.CSSProperties = {
    flex: 1, background: 'transparent',
    color: TEXT_MAIN, outline: 'none',
    fontSize: '0.9rem', border: 'none',
  };

  /* ── Logged in: role picker ── */
  if (waiterUser) {
    const cargo = waiterUser.cargo?.toLowerCase() || '';
    const full = waiterUser.acessoSistemaCompleto;

    const roles = [
      {
        show: full || ['garçom','garcom','atendente','gerente','admin','proprietário / sócio'].some(r => cargo.includes(r)),
        label: 'Garçom / Salão', desc: 'Atendimento em mesas',
        icon: <User size={30} color="#fff" />,
        grad: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        glow: 'rgba(59,130,246,0.4)',
        onClick: () => navigate('/garcom'),
      },
      {
        show: full || ['cozinha','cozinheiro','chef','bar','gerente','admin','proprietário / sócio'].some(r => cargo.includes(r)),
        label: 'Cozinha / Bar', desc: 'Preparo e produção',
        icon: <ChefHat size={30} color="#fff" />,
        grad: 'linear-gradient(135deg, #f97316, #dc2626)',
        glow: 'rgba(249,115,22,0.4)',
        onClick: () => navigate('/cozinha'),
      },
      {
        show: full || ['entregador','motoboy','delivery','gerente','admin','proprietário / sócio'].some(r => cargo.includes(r)),
        label: 'Entregas', desc: 'Delivery e motoboy',
        icon: <BikeIcon size={30} color="#fff" />,
        grad: 'linear-gradient(135deg, #10b981, #059669)',
        glow: 'rgba(16,185,129,0.4)',
        onClick: () => navigate('/minhas-entregas'),
      },
    ].filter(r => r.show);

    const showAdmin = full || ['admin','gerente','caixa'].some(r => cargo.includes(r));
    const cols = roles.length === 1 ? 1 : roles.length === 2 ? 2 : 3;

    return (
      <div
        className="auth-page min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ backgroundColor: PAGE_BG }}
      >
        <div style={{ position:'absolute', top:'-120px', left:'-80px', width:'480px', height:'480px', background:'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-150px', right:'-60px', width:'420px', height:'420px', background:'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth: cols === 3 ? '680px' : cols === 2 ? '520px' : '320px' }}>
          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <p style={{ color: TEXT_DIM, fontSize:'0.8rem', marginBottom:'4px' }}>Bem-vindo de volta,</p>
            <h2 style={{ color: TEXT_MAIN, fontSize:'1.75rem', fontWeight:700, lineHeight:1.2 }}>{waiterUser.nome}</h2>
            <span style={{
              display:'inline-block', marginTop:'8px', padding:'4px 12px',
              backgroundColor:'#1f2937', border:`1px solid ${CARD_BORDER}`,
              borderRadius:'999px', color: TEXT_DIM, fontSize:'0.75rem', fontWeight:500
            }}>
              {waiterUser.cargo}
            </span>
          </div>

          {/* Role cards */}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:'16px' }}>
            {roles.map(role => (
              <button
                key={role.label}
                onClick={role.onClick}
                style={{
                  backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`,
                  borderRadius:'16px', padding:'28px 20px',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'16px',
                  cursor:'pointer', transition:'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a2235'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#374151'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = CARD_BG; (e.currentTarget as HTMLButtonElement).style.borderColor = CARD_BORDER; }}
              >
                <div style={{
                  width:'68px', height:'68px',
                  background: role.grad,
                  borderRadius:'16px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: `0 8px 24px ${role.glow}`
                }}>
                  {role.icon}
                </div>
                <div style={{ textAlign:'center' }}>
                  <p style={{ color: TEXT_MAIN, fontWeight:700, fontSize:'0.95rem' }}>{role.label}</p>
                  <p style={{ color: TEXT_DIM, fontSize:'0.78rem', marginTop:'2px' }}>{role.desc}</p>
                </div>
                <ArrowRight size={14} color={TEXT_DIM} />
              </button>
            ))}
          </div>

          {/* Admin link */}
          {showAdmin && (
            <div style={{
              marginTop:'16px', padding:'16px', textAlign:'center',
              backgroundColor: CARD_BG, border:`1px solid ${CARD_BORDER}`, borderRadius:'12px'
            }}>
              <p style={{ fontSize:'0.65rem', color: TEXT_DIM, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Acesso completo</p>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ color:'#60a5fa', fontWeight:600, fontSize:'0.85rem', background:'none', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'6px' }}
              >
                <LayoutDashboard size={14} /> Ir para Dashboard Admin
              </button>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              marginTop:'16px', width:'100%', padding:'12px', background:'none', border:'none',
              cursor:'pointer', color: TEXT_DIM, fontSize:'0.85rem',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', transition:'color 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={e => (e.currentTarget.style.color = TEXT_DIM)}
          >
            <LogOut size={14} /> Sair / Trocar Usuário
          </button>
        </div>
      </div>
    );
  }

  /* ── Login form ── */
  return (
    <div
      className="auth-page min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div style={{ position:'absolute', top:'-120px', left:'-80px', width:'480px', height:'480px', background:'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-150px', right:'-60px', width:'420px', height:'420px', background:'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'400px' }}>
        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:'56px', height:'56px', borderRadius:'16px', marginBottom:'16px',
            background:'linear-gradient(135deg, #f97316, #dc2626)',
            boxShadow:'0 8px 32px rgba(249,115,22,0.4)'
          }}>
            <User size={26} color="#fff" />
          </div>
          <h1 style={{ color: TEXT_MAIN, fontSize:'1.5rem', fontWeight:700 }}>Acesso Funcionário</h1>
          <p style={{ color: TEXT_MUTED, fontSize:'0.875rem', marginTop:'4px' }}>Área restrita para a equipe</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: CARD_BG, border:`1px solid ${CARD_BORDER}`, borderRadius:'20px', padding:'28px', boxShadow:'0 25px 50px rgba(0,0,0,0.6)' }}>
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

            {/* Usuário */}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'0.7rem', fontWeight:600, color: TEXT_MUTED, textTransform:'uppercase', letterSpacing:'0.08em' }}>Usuário</label>
              <div style={inputWrapper('login', INPUT_BORDER_FOCUS_ORANGE)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEXT_DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  value={loginInput}
                  onChange={e => setLoginInput(e.target.value)}
                  onFocus={() => setFocusField('login')}
                  onBlur={() => setFocusField(null)}
                  style={inputBase}
                  placeholder="seu.usuario"
                  autoFocus
                />
              </div>
            </div>

            {/* Senha */}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'0.7rem', fontWeight:600, color: TEXT_MUTED, textTransform:'uppercase', letterSpacing:'0.08em' }}>Senha</label>
              <div style={inputWrapper('password', INPUT_BORDER_FOCUS_ORANGE)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEXT_DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                  style={inputBase}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor:'rgba(127,29,29,0.4)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'12px', borderRadius:'10px', fontSize:'0.875rem', textAlign:'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%', height:'48px',
                background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                color:'#fff', border:'none', borderRadius:'12px',
                fontWeight:700, fontSize:'0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                boxShadow:'0 4px 20px rgba(234,88,12,0.35)',
                transition:'all 0.2s'
              }}
            >
              {loading
                ? <><Loader2 size={18} style={{ animation:'spin 1s linear infinite' }} /> Entrando...</>
                : <>Acessar <ArrowRight size={16} /></>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
