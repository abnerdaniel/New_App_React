# 🏦 Sistema de Controle de Gastos Residenciais

Sistema completo de controle financeiro residencial desenvolvido com arquitetura moderna, separando frontend e backend. Permite gerenciar pessoas, categorias e transações financeiras (receitas e despesas), além de consultar totais por pessoa.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Como Executar](#-como-executar)
- [Funcionalidades](#-funcionalidades)
- [Documentação](#-documentação)
- [Desenvolvimento](#-desenvolvimento)

## 🎯 Sobre o Projeto

Este é um sistema completo de controle financeiro residencial que permite:

- **Gerenciar Pessoas**: Cadastrar, listar, atualizar e excluir pessoas do sistema
- **Gerenciar Categorias**: Criar e listar categorias para classificar transações
- **Gerenciar Transações**: Registrar receitas e despesas vinculadas a pessoas e categorias
- **Consultar Totais**: Visualizar totais de transações agrupadas por pessoa


## 🏗️ Arquitetura do Sistema

O projeto é composto por duas aplicações principais:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  - Interface de usuário                                 │
│  - React 19 + TypeScript + Vite                         │
│  - Porta: 5173                                          │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST
                   │
┌──────────────────▼──────────────────────────────────────┐
│                    BACKEND (.NET)                       │
│  - API REST                                             │
│  - .NET 9.0 + ASP.NET Core                              │
│  - Porta: 5000/7080                                     │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              BANCO DE DADOS (PostgreSQL)                │
│  - Armazenamento de dados                               │
│  - Entity Framework Core                                │
└─────────────────────────────────────────────────────────┘
```

### Componentes

1. **Frontend (controle-frontend)**
   - Interface web moderna e responsiva
   - Comunicação com backend via API REST
   - Roteamento com React Router
   - Gerenciamento de estado local

2. **Backend (controle-backend)**
   - API REST com ASP.NET Core
   - Arquitetura em camadas (Layered Architecture)
   - Entity Framework Core para acesso a dados
   - Documentação Swagger/OpenAPI

3. **Banco de Dados**
   - PostgreSQL para persistência
   - Migrations para versionamento do schema

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19.2.0** - Biblioteca para construção de interfaces
- **TypeScript 5.9.3** - Superset JavaScript com tipagem estática
- **Vite 7.2.4** - Build tool e servidor de desenvolvimento
- **React Router DOM 7.12.0** - Roteamento
- **Axios 1.13.2** - Cliente HTTP

### Backend
- **.NET 9.0** - Framework principal
- **ASP.NET Core Web API** - Framework para API REST
- **Entity Framework Core 9.0** - ORM
- **PostgreSQL** - Banco de dados relacional
- **Swagger/OpenAPI** - Documentação da API
- **JWT Bearer** - Autenticação (configurado)

## 📁 Estrutura do Repositório

```
New_App_React/
├── controle-backend/              # Backend .NET
│   ├── Controle.API/             # Camada de apresentação
│   ├── Controle.Application/     # Camada de aplicação
│   ├── Controle.Domain/           # Camada de domínio
│   ├── Controle.Infrastructure/  # Camada de infraestrutura
│   ├── Controle.sln              # Solution file
│   ├── Dockerfile                # Container do backend
│   └── README.md                 # Documentação do backend
│
├── controle-frontend/            # Frontend React
│   ├── src/                      # Código fonte
│   │   ├── api/                  # Serviços da API
│   │   ├── components/           # Componentes React
│   │   ├── pages/                # Páginas da aplicação
│   │   ├── routers/              # Configuração de rotas
│   │   ├── styles/               # Estilos CSS
│   │   └── types/                # Tipos TypeScript
│   ├── package.json              # Dependências Node.js
│   └── README.md                 # Documentação do frontend
│
└── README.md                     # Este arquivo
```

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Para o Backend
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) ou superior
- [PostgreSQL](https://www.postgresql.org/download/) (versão 12 ou superior)
- [Docker](https://www.docker.com/get-started) (opcional)

### Para o Frontend
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Ferramentas Recomendadas
- [Visual Studio 2022](https://visualstudio.microsoft.com/downloads/) ou [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/downloads)

## ⚙️ Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd New_App_React
```

### 2. Configurar o Backend

1. Navegue até a pasta do backend:
   ```bash
   cd controle-backend
   ```

2. Configure a string de conexão em `Controle.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=controle_gastos_residenciais;Username=postgres;Password=sua_senha"
     }
   }
   ```

3. Execute as migrações:
   ```bash
   cd Controle.API
   dotnet ef database update --project ../Controle.Infrastructure
   ```

   Para mais detalhes, consulte o [README do Backend](./controle-backend/README.md).

### 3. Configurar o Frontend

1. Navegue até a pasta do frontend:
   ```bash
   cd controle-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure a URL da API em `src/api/axios.ts`:
   ```typescript
   baseURL: "https://localhost:7080" // ou a URL do seu backend
   ```

   Para mais detalhes, consulte o [README do Frontend](./controle-frontend/README.md).

## ▶️ Como Executar

### Executar o Sistema Completo

#### Terminal 1 - Backend

```bash
cd controle-backend/Controle.API
dotnet run
```

O backend estará disponível em:
- HTTPS: `https://localhost:7080`
- HTTP: `http://localhost:5000`
- Swagger: `https://localhost:7080/swagger`

#### Terminal 2 - Frontend

```bash
cd controle-frontend
npm run dev
```

O frontend estará disponível em:
- `http://localhost:5173`

### Executar com Docker (Backend)

```bash
cd controle-backend
docker build -t controle-backend .
docker run -p 5000:80 controle-backend
```

## 🎨 Funcionalidades

### 👥 Gerenciamento de Pessoas
- Listar todas as pessoas cadastradas
- Criar nova pessoa
- Editar informações de pessoa existente
- Excluir pessoa

### 📂 Gerenciamento de Categorias
- Listar todas as categorias
- Criar nova categoria

### 💰 Gerenciamento de Transações
- Listar transações de uma pessoa
- Criar nova transação (receita ou despesa)
- Excluir transação

### 📊 Consulta de Totais
- Visualizar totais de transações agrupadas por pessoa
- Filtrar por período (futuro)

## 📚 Documentação

### Documentação dos Projetos

- **[Backend README](./controle-backend/README.md)** - Documentação completa do backend
  - Arquitetura em camadas
  - Endpoints da API
  - Configuração do banco de dados
  - Guia de desenvolvimento

- **[Frontend README](./controle-frontend/README.md)** - Documentação completa do frontend
  - Estrutura de componentes
  - Rotas da aplicação
  - Integração com API
  - Guia de desenvolvimento

### Documentação da API

A documentação interativa da API está disponível através do Swagger quando o backend estiver rodando:

```
https://localhost:7080/swagger
```

## 👨‍💻 Desenvolvimento

### Estrutura de Commits

Siga o padrão de commits semânticos:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

### Workflow de Desenvolvimento

1. **Criar uma branch:**
   ```bash
   git checkout -b feature/MinhaFeature
   ```

2. **Fazer alterações e commits:**
   ```bash
   git add .
   git commit -m "feat: Adiciona nova funcionalidade"
   ```

3. **Push e Pull Request:**
   ```bash
   git push origin feature/MinhaFeature
   ```

### Boas Práticas

#### Backend
- Mantenha a separação de responsabilidades entre camadas
- Use DTOs para comunicação entre camadas
- Implemente validações nos Services
- Use migrations para alterações no banco de dados
- Documente endpoints complexos

#### Frontend
- Use TypeScript para tipagem forte
- Mantenha componentes pequenos e focados
- Reutilize componentes quando possível
- Trate erros adequadamente
- Mantenha a estrutura de pastas organizada

## 🔧 Configurações Importantes

### CORS

O backend está configurado para aceitar requisições do frontend em `http://localhost:5173`. Para alterar, edite `Controle.API/Program.cs`.

### Portas

- **Frontend**: `5173` (Vite padrão)
- **Backend HTTP**: `5000`
- **Backend HTTPS**: `7080`

Para alterar as portas do backend, edite `Controle.API/Properties/launchSettings.json`.

### Banco de Dados

O sistema utiliza PostgreSQL. Certifique-se de que:
- O PostgreSQL está rodando
- A string de conexão está correta
- As migrações foram executadas

## 🐛 Solução de Problemas

### Erro de CORS
- Verifique se o backend está rodando
- Confirme que a URL da API no frontend está correta
- Verifique a configuração CORS no backend

### Erro de Conexão com API
- Verifique se o backend está rodando
- Confirme a URL e porta do backend
- Verifique se não há firewall bloqueando

### Erro de Migração
- Verifique se o PostgreSQL está rodando
- Confirme a string de conexão
- Verifique se o banco de dados existe

### Erro no Frontend
- Limpe o cache: `rm -rf node_modules && npm install`
- Verifique se todas as dependências estão instaladas
- Verifique erros no console do navegador

## 🚀 Próximos Passos

### Melhorias Planejadas
- [ ] Implementar autenticação e autorização completa
- [ ] Adicionar validação de formulários no frontend
- [ ] Implementar tratamento de erros mais robusto
- [ ] Adicionar testes unitários e de integração
- [ ] Melhorar feedback visual (loading, toasts, etc.)
- [ ] Adicionar filtros e busca nas listagens
- [ ] Implementar paginação
- [ ] Adicionar gráficos e relatórios
- [ ] Implementar exportação de dados

## 📄 Licença

Este projeto está sob licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação específica de cada projeto:
  - [Backend README](./controle-backend/README.md)
  - [Frontend README](./controle-frontend/README.md)

## 👥 Autores

Desenvolvido com ❤️ para controle financeiro residencial.

---

**Nota**: Certifique-se de ler os READMEs específicos de cada projeto para informações detalhadas sobre configuração e desenvolvimento.
