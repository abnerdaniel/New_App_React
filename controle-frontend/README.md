# 💰 Sistema de Controle de Gastos Residenciais - Frontend

Interface web desenvolvida em **React 19** com **TypeScript** e **Vite** para gerenciar pessoas, categorias e transações financeiras (receitas e despesas). O frontend consome a API REST do backend para realizar todas as operações.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração](#-configuração)
- [Como Executar](#-como-executar)
- [Funcionalidades](#-funcionalidades)
- [Estrutura de Páginas](#-estrutura-de-páginas)
- [Integração com Backend](#-integração-com-backend)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Desenvolvimento](#-desenvolvimento)

## 🎯 Sobre o Projeto

Este é o frontend de um sistema de controle financeiro residencial que oferece uma interface moderna e intuitiva para:

- **Gerenciar Pessoas**: Cadastrar, listar, atualizar e excluir pessoas do sistema
- **Gerenciar Categorias**: Criar e visualizar categorias para classificar transações
- **Gerenciar Transações**: Registrar receitas e despesas vinculadas a pessoas e categorias
- **Consultar Totais**: Visualizar totais de transações agrupadas por pessoa

A aplicação utiliza React Router para navegação entre páginas e Axios para comunicação com a API backend.

## 🚀 Tecnologias

- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.9.3** - Superset do JavaScript com tipagem estática
- **Vite 7.2.4** - Build tool e servidor de desenvolvimento rápido
- **React Router DOM 7.12.0** - Roteamento para aplicações React
- **Axios 1.13.2** - Cliente HTTP para requisições à API
- **ESLint** - Linter para manter qualidade do código

## 📁 Estrutura do Projeto

```
controle-frontend/
├── public/                          # Arquivos estáticos
├── src/
│   ├── api/                         # Configuração e serviços da API
│   │   ├── axios.ts                 # Configuração do Axios
│   │   ├── categorias.api.ts        # Endpoints de categorias
│   │   ├── pessoas.api.ts           # Endpoints de pessoas
│   │   ├── totais.api.ts            # Endpoints de totais
│   │   └── transacoes.api.ts        # Endpoints de transações
│   │
│   ├── components/                  # Componentes reutilizáveis
│   │   └── layout/                  # Componentes de layout
│   │       ├── Header.tsx           # Cabeçalho da aplicação
│   │       ├── Layout.tsx           # Layout principal
│   │       └── Sidebar.tsx          # Menu lateral
│   │
│   ├── pages/                       # Páginas da aplicação
│   │   ├── Categorias/              # Página de categorias
│   │   │   ├── CategoriasPage.tsx   # Página principal
│   │   │   ├── CategoriasList.tsx   # Lista de categorias
│   │   │   └── CategoriasForm.tsx   # Formulário de categoria
│   │   │
│   │   ├── ConsultaTotais/          # Página de totais
│   │   │   └── TotaisPage.tsx       # Visualização de totais
│   │   │
│   │   ├── Pessoas/                 # Página de pessoas
│   │   │   ├── PessoasPage.tsx      # Página principal
│   │   │   ├── PessoasList.tsx      # Lista de pessoas
│   │   │   └── PessoasForm.tsx      # Formulário de pessoa
│   │   │
│   │   └── Transacoes/              # Página de transações
│   │       ├── TransacoesPage.tsx   # Página principal
│   │       ├── TransacoesList.tsx   # Lista de transações
│   │       └── TransacoesForm.tsx   # Formulário de transação
│   │
│   ├── routers/                     # Configuração de rotas
│   │   └── AppRoutes.tsx            # Definição das rotas
│   │
│   ├── styles/                      # Estilos globais
│   │   └── global.css               # CSS global
│   │
│   ├── types/                       # Definições de tipos TypeScript
│   │   ├── Categoria.ts
│   │   ├── Pessoa.ts
│   │   ├── Transacao.ts
│   │   └── ...
│   │
│   ├── App.tsx                      # Componente raiz
│   └── main.tsx                     # Entry point
│
├── index.html                       # HTML principal
├── package.json                     # Dependências e scripts
├── tsconfig.json                    # Configuração TypeScript
├── tsconfig.app.json                # Config TypeScript para app
├── tsconfig.node.json               # Config TypeScript para node
├── vite.config.ts                   # Configuração do Vite
└── eslint.config.js                 # Configuração do ESLint
```

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (vem com Node.js) ou [yarn](https://yarnpkg.com/)
- O backend da aplicação deve estar rodando (veja o README do backend)

## ⚙️ Configuração

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd controle-frontend
```

### 2. Instalar Dependências

```bash
npm install
```

ou com yarn:

```bash
yarn install
```

### 3. Configurar URL da API

Edite o arquivo `src/api/axios.ts` para configurar a URL base da API:

```typescript
export const api = axios.create({
  baseURL: "https://localhost:7080", // Altere para a URL do seu backend
  headers: {
    "Content-Type": "application/json",
  },
});
```

**⚠️ Importante**:

- Certifique-se de que a URL corresponde à URL do backend
- Para desenvolvimento local, geralmente é `http://localhost:5000` ou `https://localhost:7080`
- Se o backend estiver em outra porta, ajuste conforme necessário

## ▶️ Como Executar

### Modo de Desenvolvimento

1. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

   ou

   ```bash
   yarn dev
   ```

2. **Acesse a aplicação:**

   ```
   http://localhost:5173
   ```

   O Vite iniciará um servidor de desenvolvimento com Hot Module Replacement (HMR), permitindo que as alterações sejam refletidas automaticamente no navegador.

### Build para Produção

1. **Crie o build de produção:**

   ```bash
   npm run build
   ```

   ou

   ```bash
   yarn build
   ```

2. **Visualize o build localmente:**
   ```bash
   npm run preview
   ```
   ou
   ```bash
   yarn preview
   ```

## 🎨 Funcionalidades

### 👥 Gerenciamento de Pessoas

- **Listar Pessoas**: Visualize todas as pessoas cadastradas
- **Criar Pessoa**: Adicione novas pessoas ao sistema
- **Editar Pessoa**: Atualize informações de pessoas existentes
- **Excluir Pessoa**: Remova pessoas do sistema

### 📂 Gerenciamento de Categorias

- **Listar Categorias**: Visualize todas as categorias disponíveis
- **Criar Categoria**: Adicione novas categorias para classificar transações

### 💰 Gerenciamento de Transações

- **Listar Transações**: Visualize todas as transações de uma pessoa
- **Criar Transação**: Registre novas receitas ou despesas
- **Excluir Transação**: Remova transações do sistema

### 📊 Consulta de Totais

- **Visualizar Totais**: Veja os totais de transações agrupadas por pessoa

## 🗺️ Estrutura de Páginas

A aplicação possui as seguintes rotas:

- `/` - Redireciona para `/pessoas`
- `/pessoas` - Página de gerenciamento de pessoas
- `/categorias` - Página de gerenciamento de categorias
- `/transacoes` - Página de gerenciamento de transações
- `/totais` - Página de consulta de totais

## 🔗 Integração com Backend

O frontend se comunica com o backend através de requisições HTTP usando Axios. Os serviços da API estão organizados em arquivos separados por entidade:

- `src/api/pessoas.api.ts` - Endpoints de pessoas
- `src/api/categorias.api.ts` - Endpoints de categorias
- `src/api/transacoes.api.ts` - Endpoints de transações
- `src/api/totais.api.ts` - Endpoints de totais

### Exemplo de Uso

```typescript
import { buscarPessoa, criarPessoa } from "../api/pessoas.api";

// Buscar pessoa
const pessoa = await buscarPessoa(1);

// Criar pessoa
const novaPessoa = await criarPessoa({ nome: "João", idade: 30 });
```

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria o build de produção
- `npm run preview` - Visualiza o build de produção localmente
- `npm run lint` - Executa o linter ESLint

## 👨‍💻 Desenvolvimento

### Adicionar Nova Página

1. Crie os componentes na pasta `src/pages/NovaPagina/`
2. Adicione a rota em `src/routers/AppRoutes.tsx`:

```typescript
import { NovaPagina } from '../pages/NovaPagina/NovaPaginaPage'

<Route path="/nova-pagina" element={<NovaPagina />} />
```

3. Adicione o link no menu lateral (`src/components/layout/Sidebar.tsx`)

### Adicionar Novo Endpoint da API

1. Crie ou edite o arquivo correspondente em `src/api/`
2. Use a instância `api` do Axios configurada:

```typescript
import { api } from "./axios";

export const novoEndpoint = async (data: TipoData) => {
  const response = await api.post("/api/endpoint", data);
  return response.data;
};
```

### Estrutura de Componentes

- **Pages**: Componentes de página que agrupam funcionalidades
- **Layout**: Componentes de layout reutilizáveis (Header, Sidebar, Layout)
- **Forms**: Formulários para criação/edição de entidades
- **Lists**: Listas para exibição de dados

### Boas Práticas

- Use TypeScript para tipagem forte
- Mantenha componentes pequenos e focados
- Reutilize componentes quando possível
- Use async/await para requisições assíncronas
- Trate erros adequadamente
- Mantenha a estrutura de pastas organizada

## 🐛 Solução de Problemas

### Erro de CORS

Se você encontrar erros de CORS, verifique:

1. Se o backend está rodando
2. Se a URL da API está correta em `src/api/axios.ts`
3. Se o backend está configurado para aceitar requisições do frontend (CORS)

### Erro de Conexão com API

1. Verifique se o backend está rodando
2. Confirme a URL e porta do backend
3. Verifique se não há firewall bloqueando a conexão

### Build Fails

1. Limpe o cache: `rm -rf node_modules && npm install`
2. Verifique se todas as dependências estão instaladas
3. Verifique erros de TypeScript: `npm run build`

## 📝 Notas Importantes

- ⚠️ Certifique-se de que o backend está rodando antes de iniciar o frontend
- 🔒 A aplicação não possui autenticação implementada no momento
- 🌐 O CORS está configurado no backend para aceitar requisições de `http://localhost:5173`
- 📱 A aplicação é responsiva e funciona em diferentes tamanhos de tela

## 🔄 Atualizações Futuras

- [ ] Implementar autenticação e autorização
- [ ] Adicionar validação de formulários
- [ ] Implementar tratamento de erros mais robusto
- [ ] Adicionar testes unitários e de integração
- [ ] Melhorar feedback visual (loading, toasts, etc.)
- [ ] Adicionar filtros e busca nas listagens
- [ ] Implementar paginação

## 📄 Licença

Este projeto está sob licença MIT.

## 🤝 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
