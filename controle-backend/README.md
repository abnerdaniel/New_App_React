# ⚙️ MenuTech - Backend API

API RESTful em C# (.NET) que provê todos os serviços e regras de negócio para as aplicações frontend (Admin e Cliente).

## 🛠 Tecnologias Principais

- C# / .NET 8 (ou equivalente)
- Entity Framework Core
- PostgreSQL
- Autenticação JWT
- Swagger / OpenAPI para documentação

## 🚀 Como Iniciar (Desenvolvimento Local)

1. Certifique-se de ter o **SDK do .NET** e o **PostgreSQL** instalados e rodando.
2. Configure a string de conexão no `appsettings.Development.json` ou `appsettings.json` (dentro da pasta do projeto principal, comummente `Controle.API`).
3. Rode as migrações (se aplicável):
   ```bash
   dotnet ef database update
   ```
4. Execute o projeto API:
   ```bash
   cd Controle.API
   dotnet run
   ```

## 📖 Documentação da API

Após executar o projeto localmente, acesse a interface do **Swagger** (geralmente em `https://localhost:<porta>/swagger` ou `http://localhost:<porta>/swagger`) para visualizar e testar os endpoints disponíveis.
