# 📊 MenuTech - Admin Dashboard (Frontend)

Dashboard Administrativo desenvolvido em React (com Vite) voltado para os donos de loja (Lojistas) e SuperAdmins.

Neste painel é possível:

- Gerenciar cardápio (produtos, complementos, categorias).
- Acompanhar pedidos em tempo real (Painel / Cozinha / Garçom).
- Configurar funcionamento, layout e QR Codes da loja.
- Para SuperAdmin: Gerir lojas, assinaturas e faturamento global.

## 🚀 Tecnologias

- [React](https://reactjs.org/) (Hooks, Context, Functional Components)
- [Vite](https://vitejs.dev/) - Build tool ultrarrápido
- [TypeScript](https://www.typescriptlang.org/)
- TailwindCSS (provável via design-system)
- [Axios](https://axios-http.com/) - Integração com API
- [React Router DOM](https://reactrouter.com/) - Roteamento

## 🛠 Como Executar Localmente

### Pré-requisitos

- Node.js (18+)
- Backend (`controle-backend`) rodando localmente para as requisições API funcionarem adequadamente.

### Passos

1. Instale as dependências:

   ```bash
   npm install
   # ou
   yarn install
   ```

2. Configure a URL da API, se necessário (Ex: `src/api/axios.ts` ou `.env`).

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Acesse através do endereço exibido no terminal (geralmente `http://localhost:5173`).
