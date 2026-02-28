# 📱 MenuTech - Cardápio Cliente (Frontend)

Aplicação Web voltada para o cliente final do estabelecimento. Ela atua como um Cardápio Digital Interativo onde os clientes podem explorar os produtos, montar pedidos, adicionar complementos e efetuar ou enviar o pedido para o fluxo do lojista (delivery, retirada, ou na mesa via QR Code).

## 🚀 Tecnologias

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- TailwindCSS
- [React Query](https://tanstack.com/query/latest) / Axios - Gerenciamento de estado e fetch
- [React Router DOM](https://reactrouter.com/)
- Zustand (Gerenciamento de Carrinho, se aplicável)

## 🛠 Como Executar Localmente

### Pré-requisitos

- Node.js (18+)
- Backend (`controle-backend`) rodando localmente.
- Pelo menos uma loja cadastrada com slug para testar as rotas (Ex: `/loja/nome-da-loja`).

### Passos

1. Instale as dependências:

   ```bash
   npm install
   # ou
   yarn install
   ```

2. (Opcional) Configure variáveis de ambiente caso necessário (`.env`).

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Acesse no navegador, ex: `http://localhost:5174/loja/slug-da-loja`.
