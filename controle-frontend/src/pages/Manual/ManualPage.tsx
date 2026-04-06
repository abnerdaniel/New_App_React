import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  Store,
  Users,
  Package,
  UtensilsCrossed,
  MonitorSmartphone,
  BarChart3,
  Headphones,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  Clock,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  shortTitle: string;
}

const sections: Section[] = [
  { id: 'intro', title: '1. Introdução e Proposta de Valor', shortTitle: 'Introdução', icon: BookOpen },
  { id: 'acesso', title: '2. Acesso e Segurança da Conta', shortTitle: 'Acesso', icon: ShieldCheck },
  { id: 'configuracao', title: '3. Configuração Estrutural da Loja', shortTitle: 'Minha Loja', icon: Store },
  { id: 'equipes', title: '4. Gestão de Equipes e Permissões', shortTitle: 'Equipes', icon: Users },
  { id: 'estoque', title: '5. Estoque e Gestão de Produtos', shortTitle: 'Estoque', icon: Package },
  { id: 'cardapio', title: '6. Cardápios e Promoções', shortTitle: 'Cardápio', icon: UtensilsCrossed },
  { id: 'operacao', title: '7. Operação Multicanal', shortTitle: 'Operação', icon: MonitorSmartphone },
  { id: 'atendimento-ia', title: '8. Atendimento Automatizado e WhatsApp', shortTitle: 'Atendimento', icon: MessageCircle },
  { id: 'dashboard', title: '9. Dashboard e Faturamento', shortTitle: 'Dashboard', icon: BarChart3 },
  { id: 'suporte', title: '10. Suporte e Roadmap', shortTitle: 'Suporte', icon: Headphones },
];

function SectionCard({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <section id={id} className="scroll-mt-6">
      {children}
    </section>
  );
}

function InfoBox({ type, children }: { type: 'warning' | 'tip' | 'note'; children: React.ReactNode }) {
  const styles = {
    warning: 'bg-amber-50 border-amber-300 text-amber-800',
    tip: 'bg-blue-50 border-blue-300 text-blue-800',
    note: 'bg-gray-50 border-gray-300 text-gray-700',
  };
  const icons = {
    warning: <AlertTriangle size={16} className="shrink-0 mt-0.5" />,
    tip: <Lightbulb size={16} className="shrink-0 mt-0.5" />,
    note: <BookOpen size={16} className="shrink-0 mt-0.5" />,
  };
  return (
    <div className={`flex gap-2 border-l-4 p-3 rounded-r-lg text-sm ${styles[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}

function DeepLinkButton({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors"
    >
      <ArrowRight size={14} />
      {label}
    </Link>
  );
}

function ComingSoon() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
      <Clock size={9} /> Em breve
    </span>
  );
}

function PermissionTable() {
  const rows = [
    {
      perfil: 'Garçom',
      visualizacao: 'Mapa de Mesas (Salão)',
      funcoes: 'Atribuir nomes, adicionar consumos e "Mandar para Cozinha".',
      rota: '/mesas',
      label: 'Ver Mesas',
    },
    {
      perfil: 'Cozinha',
      visualizacao: 'Monitor de Pedidos',
      funcoes: 'Visualizar itens, alterar status e sinalizar "Pronto".',
      rota: '/monitor-pedidos',
      label: 'Ver Monitor',
    },
    {
      perfil: 'Motoboy',
      visualizacao: 'Entregas Disponíveis',
      funcoes: 'Acessar endereços, dados do cliente e marcar como "Entregue".',
      rota: '/delivery',
      label: 'Ver Delivery',
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Perfil</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Visualização Principal</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Funções Permitidas</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Acesso Rápido</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.perfil} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{row.perfil}</td>
              <td className="px-4 py-3 text-gray-600">{row.visualizacao}</td>
              <td className="px-4 py-3 text-gray-600">{row.funcoes}</td>
              <td className="px-4 py-3">
                <Link
                  to={row.rota}
                  className="inline-flex items-center gap-1 text-brand-primary hover:text-brand-hover text-xs font-medium"
                >
                  <ExternalLink size={12} />
                  {row.label}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ManualPage() {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <BookOpen size={14} />
          <span>Documentação</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Manual Operacional</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Guia completo do sistema <span className="text-brand-primary font-semibold">Help me Here</span> — clique em qualquer seção para navegar diretamente ao módulo.
        </p>
      </div>

      <div className="flex gap-8 relative">
        {/* Sticky Navigation Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-0 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-brand-primary/5 border-b border-gray-100">
              <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider">Seções</p>
            </div>
            <nav className="p-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="truncate">{section.shortTitle}</span>
                    {isActive && <ChevronRight size={12} className="ml-auto shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-10 min-w-0">

          {/* Section 1 */}
          <SectionCard id="intro">
            <div className="bg-gradient-to-br from-brand-primary/5 to-white border border-brand-primary/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-primary/10 rounded-lg">
                  <BookOpen size={20} className="text-brand-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">1. Introdução e Proposta de Valor</h2>
              </div>
              <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
                <p>
                  O <strong className="text-gray-800">Help me Here</strong> é uma solução de Ponto de Venda (PDV) completa e integrada, desenvolvida para devolver ao restaurador a autonomia sobre sua operação e assegurar sua <strong>independência digital</strong>.
                </p>
                <p>
                  Em um mercado dominado por agregadores como iFood e 99 Food — que cobram taxas de até <strong>27%</strong> sobre o faturamento — nossa plataforma posiciona-se como vantagem estratégica decisiva. Com <strong className="text-brand-primary">taxas de 0%</strong> sobre as vendas, o foco é a preservação da margem de lucro.
                </p>
                <p>
                  O ecossistema unifica os pilares fundamentais do Food Service: <strong>atendimento presencial (mesas), delivery e retirada (balcão)</strong>. Além da tecnologia, o diferencial reside no suporte humanizado e direto com o próprio desenvolvedor.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <DeepLinkButton to="/dashboard" label="Ir para o Painel de Controle" />
              </div>
            </div>
          </SectionCard>

          {/* Section 2 */}
          <SectionCard id="acesso">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ShieldCheck size={20} className="text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">2. Acesso e Segurança da Conta</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>O controle de acesso centralizado garante a integridade dos dados financeiros e operacionais do seu estabelecimento.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="font-semibold text-green-800 mb-1">✔ Google Auth (Acesso Instantâneo)</p>
                    <p className="text-green-700 text-xs">Ao utilizar sua conta Google já verificada, o acesso ao sistema é imediato, sem necessidade de validação manual.</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-1">🔑 Login e Senha (Tradicional)</p>
                    <p className="text-gray-600 text-xs">Requer cadastro com e-mail e senha. Por segurança, exige <strong>aprovação obrigatória do administrador central</strong>.</p>
                  </div>
                </div>

                <InfoBox type="warning">
                  <strong>Status "Aguardando aprovação":</strong> é uma barreira de segurança para impedir acessos não autorizados. Contate o suporte via WhatsApp ou e-mail informando o e-mail cadastrado. Somente após verificação manual o painel será liberado.
                </InfoBox>
              </div>
            </div>
          </SectionCard>

          {/* Section 3 */}
          <SectionCard id="configuracao">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Store size={20} className="text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">3. Configuração Estrutural da Loja</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>A configuração detalhada da sua loja define a identidade da marca e a eficiência da comunicação com o cliente final.</p>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="font-semibold text-gray-700">Em "Minhas Lojas" você configura:</p>
                  <ul className="space-y-1.5">
                    <li className="flex gap-2"><ChevronRight size={14} className="text-brand-primary shrink-0 mt-0.5" /><span><strong>Identificação:</strong> Nome, CNPJ e Categoria (Restaurante, Pizzaria, etc.)</span></li>
                    <li className="flex gap-2"><ChevronRight size={14} className="text-brand-primary shrink-0 mt-0.5" /><span><strong>Logística:</strong> Tempos estimados (mínimo e máximo) e taxa de entrega automática</span></li>
                    <li className="flex gap-2"><ChevronRight size={14} className="text-brand-primary shrink-0 mt-0.5" /><span><strong>Aceite Automático:</strong> Ative para que pedidos entrem direto em preparo, ou desative para controle manual</span></li>
                    <li className="flex gap-2"><ChevronRight size={14} className="text-brand-primary shrink-0 mt-0.5" /><span><strong>Nota Fiscal:</strong> Customize logotipo, dados do cliente e mensagens de rodapé</span></li>
                  </ul>
                </div>

                <InfoBox type="note">
                  <strong>Integração Social e IA:</strong> Os campos de WhatsApp e Instagram são os "hooks" de dados para a futura camada de Inteligência Artificial — a IA utilizará essas conexões para disponibilizar o cardápio automaticamente ou gerar links de pedido direto nas conversas.
                </InfoBox>

                <InfoBox type="tip">
                  <strong>Via da Cozinha</strong> (Impressão para produção) está atualmente em fase final de desenvolvimento. <ComingSoon />
                </InfoBox>
              </div>
              <div className="mt-5">
                <DeepLinkButton to="/manage-stores" label="Ir para Minhas Lojas" />
              </div>
            </div>
          </SectionCard>

          {/* Section 4 */}
          <SectionCard id="equipes">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users size={20} className="text-purple-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">4. Gestão de Equipes e Permissões Operacionais</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>A delegação de funções evita gargalos operacionais. O sistema permite criar perfis restritos para que cada colaborador foque em sua tarefa.</p>

                <PermissionTable />

                <InfoBox type="tip">
                  <strong>Cadastro de Equipe:</strong> Em "Gerenciar Equipe", cadastre o funcionário e colete o <strong>Link de Acesso Único</strong> disponível nessa mesma tela para enviar ao profissional. O administrador possui controle total para editar ou bloquear acessos instantaneamente.
                </InfoBox>
              </div>
              <div className="mt-5">
                <DeepLinkButton to="/setup-employee" label="Gerenciar Equipe" />
              </div>
            </div>
          </SectionCard>

          {/* Section 5 */}
          <SectionCard id="estoque">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Package size={20} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">5. Arquitetura de Estoque e Gestão de Produtos</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>Um estoque bem configurado previne a ruptura de vendas e garante que o cardápio reflita a realidade da cozinha.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">Cadastro de Produtos Principais</p>
                    <ul className="space-y-1 text-xs">
                      <li className="flex gap-2"><ChevronRight size={12} className="text-brand-primary shrink-0 mt-0.5" /><span>Nome e descrição detalhada (crucial para o cliente)</span></li>
                      <li className="flex gap-2"><ChevronRight size={12} className="text-brand-primary shrink-0 mt-0.5" /><span>Valor, quantidade em estoque e imagem</span></li>
                      <li className="flex gap-2"><ChevronRight size={12} className="text-brand-primary shrink-0 mt-0.5" /><span>Flags <strong>"Disponível"</strong> ou <strong>"Indisponível"</strong> para controle em tempo real</span></li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">Lógica de Adicionais / Extras</p>
                    <ol className="space-y-1 text-xs list-decimal list-inside">
                      <li>Cadastre o adicional como produto independente</li>
                      <li>Ative a flag <strong>"Este produto é um adicional ou extra"</strong></li>
                      <li>Vincule-o ao produto principal</li>
                    </ol>
                    <p className="text-xs text-gray-400 mt-2">Dica: Não é necessário inserir imagens para "Extras".</p>
                  </div>
                </div>

                <InfoBox type="tip">
                  <strong>Em breve:</strong> Importação de produtos em massa via planilha. <ComingSoon />
                </InfoBox>
              </div>
              <div className="mt-5">
                <DeepLinkButton to="/estoque" label="Ir para Estoque" />
              </div>
            </div>
          </SectionCard>

          {/* Section 6 */}
          <SectionCard id="cardapio">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <UtensilsCrossed size={20} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">6. Configuração de Cardápios e Promoções</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>O cardápio interativo é sua vitrine de vendas. Organize-o para maximizar o ticket médio.</p>

                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="font-bold text-brand-primary shrink-0">01.</div>
                    <div><strong>Categorias:</strong> Separe os itens em grupos lógicos (Bebidas, Lanches, Sobremesas).</div>
                  </div>
                  <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="font-bold text-brand-primary shrink-0">02.</div>
                    <div><strong>Combos e Ofertas:</strong> Agrupe múltiplos itens sob um valor promocional, utilizando fotos de capa persuasivas e descrições claras do benefício.</div>
                  </div>
                  <div className="flex gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="font-bold text-amber-500 shrink-0">03.</div>
                    <div>
                      <strong>Agendamento por Horários</strong> (ex: Almoço vs. Jantar) — visível na interface como planejamento estratégico, porém em fase de implementação técnica. <ComingSoon />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <DeepLinkButton to="/cardapio" label="Ir para Cardápio" />
              </div>
            </div>
          </SectionCard>

          {/* Section 7 */}
          <SectionCard id="operacao">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <MonitorSmartphone size={20} className="text-indigo-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">7. Operação Multicanal: Mesas, Balcão e Delivery</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>A interface unifica todos os canais de venda em um fluxo de trabalho dinâmico.</p>

                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <span className="font-semibold text-gray-700">🍽️ Módulo Salão (Garçom)</span>
                      <Link to="/mesas" className="text-xs text-brand-primary hover:text-brand-hover flex items-center gap-1 font-medium">
                        <ExternalLink size={11} /> Abrir
                      </Link>
                    </div>
                    <div className="px-4 py-3 text-xs">
                      Através do mapa de mesas, o garçom registra o nome do cliente, adiciona itens ao pedido e utiliza o botão <strong>"Mandar para Cozinha"</strong>.
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <span className="font-semibold text-gray-700">👨‍🍳 Módulo Cozinha (Monitor de Pedidos)</span>
                      <Link to="/monitor-pedidos" className="text-xs text-brand-primary hover:text-brand-hover flex items-center gap-1 font-medium">
                        <ExternalLink size={11} /> Abrir
                      </Link>
                    </div>
                    <div className="px-4 py-3 text-xs">
                      É o hub central. Permite gerenciar o status individual de cada item, editar pedidos em tempo real e será o ponto futuro de impressão.
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <span className="font-semibold text-gray-700">🛵 Módulo Delivery e Motoboy</span>
                      <Link to="/delivery" className="text-xs text-brand-primary hover:text-brand-hover flex items-center gap-1 font-medium">
                        <ExternalLink size={11} /> Abrir
                      </Link>
                    </div>
                    <div className="px-4 py-3 text-xs space-y-1">
                      <p>Após o status ser alterado para <strong>"Pronto"</strong>, o administrador utiliza a opção <strong>"Despachar para Entregador"</strong>.</p>
                      <p>O motoboy visualiza os dados de entrega em tempo real. Pedidos concluídos ficam visíveis por <strong>24 horas</strong> para conferência.</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <span className="font-semibold text-gray-700">🏪 Módulo PDV Balcão</span>
                      <Link to="/pdv" className="text-xs text-brand-primary hover:text-brand-hover flex items-center gap-1 font-medium">
                        <ExternalLink size={11} /> Abrir
                      </Link>
                    </div>
                    <div className="px-4 py-3 text-xs">
                      Interface para vendas rápidas com busca de produtos por nome e finalização imediata de pedidos para retirada no balcão.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Section 8: Atendimento Automatizado */}
          <SectionCard id="atendimento-ia">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MessageCircle size={20} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">8. Atendimento Automatizado e WhatsApp</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>Nesta área você conecta o WhatsApp da loja para disparo de mensagens e notificações automáticas.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">Conexão do Número</p>
                    <ul className="space-y-1 text-xs list-disc list-inside">
                      <li>Use o leitor de QR Code para vincular seu celular (Recomendamos um chip isolado apenas para isso).</li>
                      <li>Nunca desligue o aparelho da internet, ou as mensagens pararão de ser enviadas.</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">Resumo de Pedidos e Variáveis</p>
                    <ul className="space-y-1 text-xs list-disc list-inside">
                      <li>Ative <strong>"Resumo após Pedido"</strong> para enviar a notificação inicial automaticamente e configurá-la.</li>
                      <li>Use a <strong>Engrenagem</strong> ao lado para personalizar a mensagem usando tags ({'{NomeCliente}'}, {'{Total}'}).</li>
                      <li>Ligue/desligue as chaves de Endereço e Metódo de Pagamento do resumo.</li>
                    </ul>
                  </div>
                </div>

                <InfoBox type="warning">
                  <strong>Regras da Meta e Bloqueios:</strong> Não envie massivamente propagandas por ali, o envio de atualizações e resumos não tem problema, mas cuidado caso use números virgens (sem aquecimento).
                </InfoBox>

                <div className="mt-5">
                  <DeepLinkButton to="/atendimento-ia" label="Ir para Atendimento Automatizado" />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Section 9 */}
          <SectionCard id="dashboard">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <BarChart3 size={20} className="text-teal-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">9. Dashboard, Faturamento e Inteligência de Dados</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>A transformação de dados em decisões estratégicas ocorre através do monitoramento constante.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-700 mb-1">📊 Dashboard Principal</p>
                    <p className="text-xs">Acompanhamento do faturamento diário em tempo real e controle de abertura/fechamento da loja.</p>
                    <Link to="/dashboard" className="text-xs text-brand-primary hover:text-brand-hover mt-2 flex items-center gap-1 font-medium">
                      <ExternalLink size={11} /> Acessar
                    </Link>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-700 mb-1">💰 Módulo Faturamento</p>
                    <p className="text-xs">Extração de relatórios por períodos específicos para controle contábil e análise de sazonalidade.</p>
                    <Link to="/financeiro" className="text-xs text-brand-primary hover:text-brand-hover mt-2 flex items-center gap-1 font-medium">
                      <ExternalLink size={11} /> Acessar
                    </Link>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-700 mb-1">⚡ Gargalos Operacionais</p>
                    <p className="text-xs">Monitoramento dos status (Pendente, Preparando, Pronto) para identificar atrasos e otimizar o tempo de resposta.</p>
                    <Link to="/monitor-pedidos" className="text-xs text-brand-primary hover:text-brand-hover mt-2 flex items-center gap-1 font-medium">
                      <ExternalLink size={11} /> Ver Monitor
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Section 10 */}
          <SectionCard id="suporte">
            <div className="bg-gradient-to-br from-brand-primary/8 to-white border border-brand-primary/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-primary/10 rounded-lg">
                  <Headphones size={20} className="text-brand-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">10. Suporte Técnico e Roadmap de Evolução</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>O Help me Here é um sistema vivo, em constante aprimoramento. Nosso compromisso é com o crescimento sustentável do seu restaurante.</p>

                <div className="bg-white border border-brand-primary/20 rounded-xl p-4">
                  <p className="font-semibold text-gray-800 mb-2">📞 Suporte Direto</p>
                  <p className="text-xs mb-3">Em caso de anomalias técnicas ou dúvidas operacionais, o contato é feito diretamente com o desenvolvedor via WhatsApp — sem burocracias ou intermediários.</p>
                  <a
                    href="https://wa.me/5521991680708"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                    Falar com Suporte
                  </a>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-800 mb-3">🚀 Roadmap de Atualizações</p>
                  <ul className="space-y-2">
                    {[
                      'Integração total com pedidos conversacionais via IA (WhatsApp/Instagram)',
                      'Unificação de pedidos iFood diretamente no monitor do sistema',
                      'Funcionalidade completa de agendamento de cardápios por horário',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs">
                        <Clock size={12} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <InfoBox type="tip">
                  <strong>Recomendações Finais:</strong> Mantenha as imagens dos produtos atualizadas e revise seu estoque diariamente. A consistência operacional é o segredo para a satisfação do cliente.
                </InfoBox>
              </div>
            </div>
          </SectionCard>

          {/* Footer */}
          <div className="text-center py-8 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Manual Operacional — <span className="font-semibold text-brand-primary">Help me Here</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Sistema Integrado de Gestão para Restaurantes</p>
          </div>

        </div>
      </div>
    </div>
  );
}
