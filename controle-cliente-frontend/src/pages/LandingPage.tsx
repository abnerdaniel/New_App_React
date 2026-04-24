import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Settings,
  ChefHat,
  Sparkles,
  Bot,
  Truck,
  ArrowRight,
  Store,
  ExternalLink,
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    iconBg: 'bg-emerald-50',
    iconBorder: 'border-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Mais Lucro, Zero Caos',
    description:
      'Livre-se das taxas abusivas dos aplicativos de delivery (que chegam a 27%) e transforme o caos do atendimento no WhatsApp em um processo automático e altamente rentável.',
  },
  {
    icon: ShoppingBag,
    iconBg: 'bg-brand-light',
    iconBorder: 'border-red-100',
    iconColor: 'text-brand-primary',
    title: 'Para o Cliente Final',
    description:
      'Cardápio Interativo, múltiplos formatos (Mesa, Delivery, Retirada) e URLs super amigáveis para vendas direto do Instagram.',
  },
  {
    icon: Settings,
    iconBg: 'bg-orange-50',
    iconBorder: 'border-orange-100',
    iconColor: 'text-orange-500',
    title: 'Para o Dono — Master Control',
    description:
      'Gestão de cardápio descomplicada, Funil "Pulso da Operação" em tempo real, KPIs cruciais e Alertas Inteligentes de estoque.',
  },
  {
    icon: ChefHat,
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-100',
    iconColor: 'text-amber-600',
    title: 'Para a Operação (Salão e Cozinha)',
    description:
      'Painel ágil para garçons e Monitor KDS moderno para organizar e agilizar os preparos na cozinha.',
  },
  {
    icon: Sparkles,
    iconBg: 'bg-teal-50',
    iconBorder: 'border-teal-100',
    iconColor: 'text-teal-500',
    title: 'Diferenciais e Suporte',
    description:
      'Sistema de Fallback Visual para produtos sem foto, QR Codes automáticos e infraestrutura robusta e segura.',
  },
];

const comingSoon = [
  {
    icon: Bot,
    iconBg: 'bg-sky-50',
    iconBorder: 'border-sky-100',
    iconColor: 'text-sky-500',
    title: 'Autoatendimento com IA',
    description:
      'Assistente virtual inteligente para responder dúvidas e realizar pedidos de forma 100% automática no WhatsApp.',
  },
  {
    icon: Truck,
    iconBg: 'bg-rose-50',
    iconBorder: 'border-rose-100',
    iconColor: 'text-rose-500',
    title: 'Integrações',
    description:
      'Conexão direta com iFood, 99Food e outros aplicativos de entrega para centralizar todos os seus pedidos em uma única tela.',
  },
];

function getAdminUrl() {
  return `${window.location.protocol}//admin.${window.location.host}`;
}

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-background text-text-dark">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <span className="text-xl font-extrabold tracking-tight text-text-dark select-none">
            Menu<span className="text-brand-primary">Tech</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/parceiros')}
              className="text-sm font-semibold text-text-muted hover:text-text-dark transition-colors"
            >
              Parceiros
            </button>
            <a
              href={getAdminUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-hover px-4 py-2 rounded-lg transition-colors"
            >
              Acesso Lojista
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative diagonal slash */}
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 w-[420px] h-[420px] bg-brand-primary/5 rotate-12 rounded-3xl pointer-events-none"
        />

        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28 lg:py-36 relative z-10">
          <div className="max-w-2xl">
            <p className="animate-fade-in text-sm font-bold uppercase tracking-widest text-brand-primary mb-4">
              Plataforma completa de gestão
            </p>
            <h1 className="animate-fade-up text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-text-dark mb-6">
              Gestão{' '}
              <span className="text-brand-primary relative">
                Inteligente
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 w-full h-1.5 bg-brand-primary/20 rounded-full"
                />
              </span>
              <br />
              para o seu Restaurante
            </h1>
            <p className="animate-fade-up text-lg sm:text-xl text-text-muted leading-relaxed mb-10" style={{ animationDelay: '0.12s' }}>
              O MenuTech é a plataforma completa para revolucionar o atendimento,
              otimizar a cozinha e fornecer visão 360° da sua operação — tudo sem
              depender de marketplaces caros.
            </p>

            <div className="animate-fade-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.24s' }}>
              <a
                href={getAdminUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="animate-pulse-glow inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-hover text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors"
              >
                Começar Agora
                <ArrowRight size={20} />
              </a>
              <button
                onClick={() => navigate('/parceiros')}
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-brand-primary text-text-dark font-bold px-8 py-4 rounded-lg text-lg transition-colors"
              >
                <Store size={20} />
                Ver Parceiros
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-surface-background py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-primary mb-3">
              Funcionalidades
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-dark">
              Tudo que você precisa em um só lugar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="animate-fade-up group bg-white rounded-2xl p-7 border border-gray-100 hover:border-brand-primary/40 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${feat.iconBg} border ${feat.iconBorder} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`${feat.iconColor} w-6 h-6`} />
                  </div>
                  <h3 className="text-lg font-bold text-text-dark mb-2">{feat.title}</h3>
                  <p className="text-text-muted leading-relaxed text-sm">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── COMING SOON ─── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full mb-4">
              Em Breve
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-dark">
              O que vem por aí
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {comingSoon.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="animate-slide-in-left flex items-start gap-5 bg-surface-background rounded-2xl p-7 border border-gray-100"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <div
                    className={`shrink-0 w-12 h-12 rounded-xl ${feat.iconBg} border ${feat.iconBorder} flex items-center justify-center`}
                  >
                    <Icon className={`${feat.iconColor} w-6 h-6`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-dark mb-1">{feat.title}</h3>
                    <p className="text-text-muted leading-relaxed text-sm">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden bg-text-dark py-20 md:py-24">
        <div
          aria-hidden="true"
          className="absolute -left-16 -bottom-16 w-72 h-72 bg-brand-primary/10 rotate-45 rounded-3xl pointer-events-none"
        />
        <div className="max-w-3xl mx-auto px-5 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-5">
            Pronto para revolucionar sua operação?
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Cadastre seu restaurante e comece a vender com total controle, sem
            taxas abusivas e com tecnologia de ponta.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={getAdminUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-hover text-white font-bold px-10 py-4 rounded-lg text-lg transition-colors"
            >
              Cadastrar Restaurante
              <ArrowRight size={20} />
            </a>
            <button
              onClick={() => navigate('/parceiros')}
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-600 hover:border-white text-white font-bold px-10 py-4 rounded-lg text-lg transition-colors"
            >
              Explorar Parceiros
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-500 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span>
            © {new Date().getFullYear()}{' '}
            <span className="font-bold text-gray-300">MenuTech</span>. Todos os
            direitos reservados.
          </span>
          <div className="flex gap-6">
            <button onClick={() => navigate('/parceiros')} className="hover:text-white transition-colors">
              Parceiros
            </button>
            <a href={getAdminUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Acesso Lojista
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
