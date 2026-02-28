# PLAN: Modernização da Página de Login do Admin (MenuTech)

## 📌 Objetivo

Redesenhar a página de login do painel administrativo (`controle-frontend/src/pages/Auth/LoginPage.tsx`). O objetivo é transformar a tela de login atual (focada apenas no formulário) em uma **Landing Page moderna** que apresente as funcionalidades e diferenciais do produto, melhorando a conversão e percepção de valor.

## 🛠 Abordagem Arquitetural (Split Screen Moderno)

A nova página será dividida em duas áreas principais:

1. **Lado Esquerdo (Branding & Funcionalidades):**
   - Fundo com cor base da marca e gradientes/abstrações.
   - Textos de impacto destacando:
     - 🛍️ **Para o Cliente Final** (Cardápio Interativo, Formatos de Atendimento, URLs Amigáveis)
     - ⚙️ **Para o Dono do Restaurante** (Gestão, Visão 360º, Funil "Pulso da Operação", Lojas e Métricas)
     - 👨‍🍳 **Para a Operação (Garçons e Cozinha)** (UX Otimizada, KDS)
   - Layout animado ou cards com glassmorphism apresentando esses pontos essenciais.

2. **Lado Direito (Acesso & Formulário):**
   - O formulário atual de Login/Registro e Google Login, com refinamentos visuais de uma Landing Page SAAS (bordas suaves, sombras elegantes, tipografia moderna).

## 🚀 Fase 2: Implementação e Agentes Envolvidos

Após a aprovação deste plano, iniciaremos a **Fase 2 (Implementação Paralela)** utilizando os seguintes agentes:

1. **`frontend-specialist`**:
   - Vai refatorar `LoginPage.tsx` para o layout de _Split Screen_.
   - Criar um componente de apresentação (`ProductFeatures`) para não poluir o arquivo principal.
   - Garantir que o design atenda aos requisitos SAAS modernos (UI/UX limpa, responsiva).

2. **`backend-specialist` / `orchestrator` (Suporte)**:
   - Auxiliar verificando se as chamadas de login não sofrerão impacto.

3. **`test-engineer` / `code-reviewer`**:
   - Rodará os scripts de verificação (ex: `lint_runner.py`, testes básicos de renderização).
   - Validar responsividade para mobile (onde o Split Screen vira uma coluna única).

## ✅ Próximos Passos

Solicitamos a aprovação deste plano para acionar os agentes na Fase 2.
