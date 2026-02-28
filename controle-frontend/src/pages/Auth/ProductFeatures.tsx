import { ShoppingBag, Settings, ChefHat, Sparkles, Bot, Truck, TrendingUp } from "lucide-react";

export function ProductFeatures() {
  return (
    <div className="flex flex-col justify-center h-full p-10 lg:p-20 text-slate-800 relative z-10">
      <div className="mb-12">
        <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight text-slate-900">
          Gestão <span className="text-brand-primary">Inteligente</span> <br />
          para o seu Restaurante
        </h2>
        <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
          O MenuTech é a plataforma completa para revolucionar o atendimento, 
          otimizar a cozinha e fornecer visão 360º da sua operação.
        </p>
      </div>

      <div className="space-y-8">
        {/* Feature 0 - Pain Point */}
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
            <TrendingUp className="text-emerald-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-slate-800">Mais Lucro, Zero Caos</h3>
            <p className="text-slate-500 leading-snug">
              Livre-se das taxas abusivas dos aplicativos de delivery (que chegam a 27%) e transforme o caos do atendimento no WhatsApp em um processo automático e altamente rentável.
            </p>
          </div>
        </div>
        {/* Feature 1 */}
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
            <ShoppingBag className="text-brand-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-slate-800">Para o Cliente Final</h3>
            <p className="text-slate-500 leading-snug">
              Cardápio Interativo, múltiplos formatos (Mesa, Delivery, Retirada) e URLs super amigáveis para vendas direto do Instagram.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
            <Settings className="text-orange-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-slate-800">Para o Dono ("Master Control")</h3>
            <p className="text-slate-500 leading-snug">
              Gestão de cardápio descomplicada, Funil "Pulso da Operação" em tempo real, KPIs cruciais e Alertas Inteligentes de estoque.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shadow-sm">
            <ChefHat className="text-purple-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-slate-800">Para a Operação (Salão e Cozinha)</h3>
            <p className="text-slate-500 leading-snug">
              Painel ágil para garçons e Monitor KDS moderno para organizar e agilizar os preparos na cozinha.
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 shadow-sm">
            <Sparkles className="text-teal-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-slate-800">Diferenciais e Suporte</h3>
            <p className="text-slate-500 leading-snug">
              Sistema de Fallback Visual para produtos sem foto, QR Codes automáticos e infraestrutura robusta e segura.
            </p>
          </div>
        </div>

        {/* Feature 5 (Em Breve) */}
        <div className="flex items-start gap-5 opacity-90 mt-10">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
            <Bot className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
              Autoatendimento com IA 
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">
                Em Breve
              </span>
            </h3>
            <p className="text-slate-500 leading-snug">
              Assistente virtual inteligente para responder dúvidas e realizar pedidos de forma 100% automática no WhatsApp.
            </p>
          </div>
        </div>

        {/* Feature 6 (Em Breve) */}
        <div className="flex items-start gap-5 opacity-90 mt-6">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-sm">
            <Truck className="text-rose-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
              Integrações 
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
                Em Breve
              </span>
            </h3>
            <p className="text-slate-500 leading-snug">
              Conexão direta com iFood, 99Food e outros aplicativos de entrega para centralizar todos os seus pedidos em uma única tela.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
