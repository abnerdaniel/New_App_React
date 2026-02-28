# PLAN: Adaptação da Página de Login ao Tema do Admin

## 📌 Objetivo

Ajustar o visual da página de login recém-recriada (`LoginPage.tsx` e `ProductFeatures.tsx`) para que fique 100% alinhada com a identidade visual do recém-criado tema Admin do projeto (MenuTech).
Atualmente, a página de login usa tons escuros (`slate-900`, bg azulado), enquanto o projeto se baseia numa paleta clara com toques vibrantes em vermelho (ifood-like / MenuTech delivery red).

## 🎨 Análise do Tema Global

Com base em `src/styles/global.css` e `tailwind.config.js`:

- **Cor Primária:** `#EA1D2C` (Vermelho brand)
- **Cor Primária Hover:** `#C91622`
- **Superfícies:** Branca (`#FFFFFF`) e Fundos Off-white (`#F7F7F7`)
- **Textos:** Escuros (`#3E3E3E`) e Suaves (`#717171`)
- **Estilo:** Moderno, limpo (clean), focado em usabilidade SAAS delivery.

## 🛠 Proposta de Ajuste (Light & Modern Theme)

Iremos abandonar o fundo escuro (Dark Mode) da página de login e convertê-la para um layout claro, sofisticado e vibrante, alinhado ao tema.

### Lado Esquerdo (`ProductFeatures.tsx` - O Produto)

1. **Fundo:** Passará a ter um fundo branco ou um gradiente muito suave (ex: um off-white que puxe para o cinza bem claro).
2. **Textos:** Títulos escuros (`text-slate-900` ou a cor nativa `--text-dark`), subtítulos cinza-médio (`text-slate-500`).
3. **Ícones:** Manteremos a paleta variada nos ícones para dar cor e vida, mas reduziremos a intensidade dos glows para se adequarem a fundos claros, ou podemos focar tudo no vermelho da marca (`#EA1D2C`).

### Lado Direito (`LoginPage.tsx` - O Acesso)

1. **Fundo Geral:** Passará de `bg-[#0a0f1e]` para um off-white sutil (`bg-gray-50`).
2. **Card de Login:** Fundo banco puro (`bg-white`) com borda suave (`border-gray-200`) e sombra leve moderna (`shadow-lg`).
3. **Inputs/Botões:** O botão de login principal usará a cor Primária do sistema (Vermelho: `bg-[#EA1D2C]` hover `bg-[#C91622]`).
4. **Abas:** Abas de 'Entrar' e 'Criar Conta' com borda de destaque vermelha em vez de azul.

## 🚀 Próximos Passos

Após sua aprovação, o agente `frontend-specialist` irá modificar os arquivos `LoginPage.tsx` e `ProductFeatures.tsx`, assegurando a tipografia (Inter) e as cores adequadas através de utilitários do Tailwind.

Por fim, o `test-engineer` vai rodar a checagem tsc e de linter.
