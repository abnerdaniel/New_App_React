# 🏦 Sistema de Controle de Gastos Residenciais - Backend

Sistema de controle financeiro desenvolvido em **.NET 9.0** com arquitetura em camadas (Layered Architecture). A aplicação permite gerenciar pessoas, categorias e transações financeiras (receitas e despesas), além de consultar totais por pessoa.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração](#-configuração)
- [Como Executar](#-como-executar)
- [Endpoints da API](#-endpoints-da-api)
- [Banco de Dados](#-banco-de-dados)
- [Docker](#-docker)
- [Desenvolvimento](#-desenvolvimento)

## 🎯 Sobre o Projeto

Este é o backend de um sistema de controle financeiro residencial que permite:

- **Gerenciar Pessoas**: Cadastrar, listar, atualizar e excluir pessoas do sistema
- **Gerenciar Categorias**: Criar e listar categorias para classificar transações
- **Gerenciar Transações**: Registrar receitas e despesas vinculadas a pessoas e categorias
- **Consultar Totais**: Visualizar totais de transações agrupadas por pessoa

O sistema foi desenvolvido seguindo boas práticas de arquitetura de software, com separação de responsabilidades em camadas bem definidas.

## 🚀 Tecnologias

- **.NET 9.0** - Framework principal
- **ASP.NET Core Web API** - Framework para construção da API REST
- **Entity Framework Core 9.0** - ORM para acesso a dados
- **PostgreSQL** - Banco de dados relacional
- **Swagger/OpenAPI** - Documentação interativa da API
- **JWT Bearer** - Autenticação (configurado, não implementado)
- **Docker** - Containerização da aplicação

## 🏗️ Arquitetura

O projeto segue a **Arquitetura em Camadas (Layered Architecture)**, separando as responsabilidades em quatro camadas principais:

### Camadas do Projeto

1. **Controle.API** (Camada de Apresentação)
   - Controllers REST para exposição dos endpoints
   - Extensões para configuração (DI, Swagger, CORS, Middleware)
   - Entry point da aplicação (`Program.cs`)

2. **Controle.Application** (Camada de Aplicação)
   - Services com a lógica de negócio
   - DTOs (Data Transfer Objects) para comunicação entre camadas
   - Interfaces de serviços
   - Classe `Result` para tratamento de resultados

3. **Controle.Domain** (Camada de Domínio)
   - Entidades do domínio (Pessoa, Categoria, Transacao)
   - Interfaces de repositórios (contratos)

4. **Controle.Infrastructure** (Camada de Infraestrutura)
   - Implementação dos repositórios
   - DbContext e configurações do Entity Framework
   - Migrations do banco de dados
   - Configurações de mapeamento das entidades

### Entidades do Domínio

- **Pessoa**: Representa uma pessoa no sistema
  - `Id`: Identificador único
  - `Nome`: Nome da pessoa
  - `Idade`: Idade da pessoa

- **Categoria**: Categorização de transações
  - `Id`: Identificador único
  - `Descricao`: Descrição da categoria
  - `Finalidade`: Finalidade da categoria

- **Transacao**: Transações financeiras (receitas e despesas)
  - `Id`: Identificador único
  - `Descricao`: Descrição da transação
  - `Valor`: Valor da transação
  - `Tipo`: Tipo da transação ("receita" ou "despesa")
  - `PessoaId`: Referência à pessoa
  - `CategoriaId`: Referência à categoria

## 📁 Estrutura do Projeto

```
controle-backend/
├── Controle.API/                    # Camada de Apresentação
│   ├── Controllers/                 # Controllers REST
│   │   ├── AuthController.cs
│   │   ├── CategoriasController.cs
│   │   ├── ConsultaTotaisController.cs
│   │   ├── PessoasController.cs
│   │   └── TransacoesController.cs
│   ├── Extensions/                  # Extensões de configuração
│   │   ├── AuthenticationExtensions.cs
│   │   ├── CorsExtensions.cs
│   │   ├── DependencyInjection.cs
│   │   ├── MiddlewareExtensions.cs
│   │   └── SwaggerExtensions.cs
│   ├── Program.cs                   # Entry point
│   └── appsettings.json             # Configurações
│
├── Controle.Application/            # Camada de Aplicação
│   ├── DTOs/                        # Data Transfer Objects
│   │   ├── CategoriaRequestResponse.cs
│   │   ├── ConsultaTotaisRequestResponse.cs
│   │   ├── PessoaRequestResponse.cs
│   │   └── TransacaoRequestResponse.cs
│   ├── Interfaces/                  # Interfaces de serviços
│   │   ├── ICategoriaService.cs
│   │   ├── IConsultaTotaisService.cs
│   │   ├── IPessoaService.cs
│   │   └── ITransacaoService.cs
│   └── Services/                    # Implementação dos serviços
│       ├── CategoriaService.cs
│       ├── ConsultaTotaisService.cs
│       ├── PessoaService.cs
│       ├── Result.cs
│       └── TransacaoService.cs
│
├── Controle.Domain/                  # Camada de Domínio
│   ├── Entities/                    # Entidades do domínio
│   │   ├── Categoria.cs
│   │   ├── Pessoa.cs
│   │   └── Transacao.cs
│   └── Interfaces/                  # Interfaces de repositórios
│       ├── ICategoriaRepository.cs
│       ├── IPessoaRepository.cs
│       └── ITransacaoRepository.cs
│
└── Controle.Infrastructure/         # Camada de Infraestrutura
    ├── Configurations/              # Configurações do EF Core
    │   ├── CategoriaConfiguration.cs
    │   ├── PessoaConfiguration.cs
    │   └── TransacaoConfiguration.cs
    ├── Data/                        # DbContext
    │   ├── AppDbContext.cs
    │   └── AppDbContextFactory.cs
    ├── Migrations/                  # Migrações do banco
    └── Repositories/                 # Implementação dos repositórios
        ├── CategoriaRepository.cs
        ├── PessoaRepository.cs
        └── TransacaoRepository.cs
```

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) ou superior
- [PostgreSQL](https://www.postgresql.org/download/) (versão 12 ou superior) ou acesso a um servidor PostgreSQL
- [Docker](https://www.docker.com/get-started) (opcional, para executar via container)
- IDE de sua preferência:
  - [Visual Studio 2022](https://visualstudio.microsoft.com/downloads/)
  - [Visual Studio Code](https://code.visualstudio.com/) com extensão C#
  - [JetBrains Rider](https://www.jetbrains.com/rider/)

## ⚙️ Configuração

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd controle-backend
```

### 2. Configurar a String de Conexão

Edite o arquivo `Controle.API/appsettings.json` ou `Controle.API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=controle_gastos_residenciais;Username=postgres;Password=sua_senha"
  },
  "Jwt": {
    "Key": "sua_chave_secreta_aqui_com_pelo_menos_32_caracteres"
  }
}
```

**⚠️ Importante**: 
- Substitua `sua_senha` pela senha do seu PostgreSQL
- A chave JWT deve ter pelo menos 32 caracteres
- Para produção, use variáveis de ambiente ou Azure Key Vault

### 3. Criar o Banco de Dados

Execute as migrações para criar o banco de dados e as tabelas:

```bash
cd Controle.API
dotnet ef database update --project ../Controle.Infrastructure
```

Ou usando o .NET CLI diretamente:

```bash
dotnet ef database update --project Controle.Infrastructure --startup-project Controle.API
```

## ▶️ Como Executar

### Execução Local

1. **Navegue até a pasta do projeto API:**
   ```bash
   cd Controle.API
   ```

2. **Restaure as dependências:**
   ```bash
   dotnet restore
   ```

3. **Execute a aplicação:**
   ```bash
   dotnet run
   ```

4. **Acesse a documentação Swagger:**
   - HTTPS: `https://localhost:5001/swagger` ou `https://localhost:7080/swagger`
   - HTTP: `http://localhost:5000/swagger` ou `http://localhost:5080/swagger`

   As portas podem variar conforme configurado no `launchSettings.json`.

### Execução com Docker

1. **Construir a imagem:**
   ```bash
   docker build -t controle-backend .
   ```

2. **Executar o container:**
   ```bash
   docker run -p 5000:80 controle-backend
   ```

   Ou usando docker-compose (se configurado):
   ```bash
   docker-compose up
   ```

## 🔌 Endpoints da API

A API expõe os seguintes endpoints:

### 👥 Pessoas (`/api/pessoas`)

- `GET /api/pessoas/busca/{id}` - Busca uma pessoa por ID
- `POST /api/pessoas/criar` - Cria uma nova pessoa
- `PUT /api/pessoas/atualiza` - Atualiza dados de uma pessoa
- `DELETE /api/pessoas/deleta/{id}` - Deleta uma pessoa

### 📂 Categorias (`/api/categorias`)

- `GET /api/categorias/lista` - Lista todas as categorias
- `POST /api/categorias/criar` - Cria uma nova categoria

### 💰 Transações (`/api/transacao`)

- `GET /api/transacao/lista/{pessoaId}` - Lista todas as transações de uma pessoa
- `POST /api/transacao/criar` - Cria uma nova transação
- `DELETE /api/transacao/deleta/{id}` - Deleta uma transação

### 📊 Consulta de Totais (`/api/consultaTotais`)

- `GET /api/consultaTotais/lista` - Consulta totais de transações por pessoa

### 📖 Documentação Interativa

Acesse `/swagger` para ver a documentação completa da API com exemplos de requisições e respostas.

## 🗄️ Banco de Dados

O projeto utiliza **PostgreSQL** como banco de dados. As tabelas são gerenciadas através de **Entity Framework Core Migrations**.

### Executar Migrações

Para aplicar as migrações existentes:
```bash
dotnet ef database update --project Controle.Infrastructure --startup-project Controle.API
```

### Criar Nova Migração

Para criar uma nova migração após alterar as entidades:
```bash
dotnet ef migrations add NomeDaMigracao --project Controle.Infrastructure --startup-project Controle.API
```

### Reverter Migração

Para reverter a última migração:
```bash
dotnet ef database update NomeDaMigracaoAnterior --project Controle.Infrastructure --startup-project Controle.API
```

## 🐳 Docker

O projeto inclui um `Dockerfile` para containerização. Para usar:

1. **Construir a imagem:**
   ```bash
   docker build -t controle-backend .
   ```

2. **Executar o container:**
   ```bash
   docker run -p 5000:80 \
     -e ConnectionStrings__DefaultConnection="Host=seu_host;Port=5432;Database=controle_gastos_residenciais;Username=postgres;Password=sua_senha" \
     controle-backend
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

### Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Boas Práticas

- Mantenha a separação de responsabilidades entre as camadas
- Use DTOs para comunicação entre camadas
- Implemente validações nos Services
- Documente endpoints complexos
- Escreva testes unitários para Services
- Use migrations para alterações no banco de dados

## 📝 Notas Importantes

- ⚠️ A autenticação JWT está configurada mas **não está implementada** no `AuthController`
- 📚 A documentação Swagger está habilitada e pode ser acessada durante o desenvolvimento
- 🔒 O projeto utiliza nullable reference types (`<Nullable>enable</Nullable>`)
- 🌐 CORS está configurado para permitir requisições do frontend React em `http://localhost:5173`

## 🔗 Integração com Frontend

O backend está configurado para aceitar requisições do frontend React que roda em `http://localhost:5173`. A configuração CORS está em `Program.cs`.

Para alterar a URL permitida, edite o arquivo `Controle.API/Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173") 
                         .AllowAnyMethod()
                         .AllowAnyHeader());
});
```

## 📄 Licença

Este projeto está sob licença MIT.

## 🤝 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
