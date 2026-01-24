# Sistema de Autenticação - Instruções

## Funcionalidades Implementadas

✅ **Backend (.NET)**
- Entidade Usuario com campos: Id, Email, Nome, PasswordHash, DataCriacao, UltimoAcesso
- Repository pattern para gerenciar usuários
- AuthService com JWT para login e registro
- Endpoints de autenticação: `/api/auth/login` e `/api/auth/register`
- Hash de senha usando SHA256
- Tokens JWT com validade de 7 dias

✅ **Frontend (React)**
- Página de Login com formulários de Login e Registro
- Context API para gerenciamento de estado de autenticação
- Rotas privadas que redirecionam para login se não autenticado
- Interceptor axios para adicionar token JWT automaticamente
- Botão de logout no header
- Persistência de autenticação no localStorage

## Como Usar

### 1. Criar a Migration no Backend

No terminal, navegue até o diretório do backend e execute:

```bash
cd controle-backend
dotnet ef migrations add AddUsuarioTable --project Controle.Infrastructure --startup-project Controle.API
dotnet ef database update --project Controle.Infrastructure --startup-project Controle.API
```

### 2. Executar o Backend

```bash
cd Controle.API
dotnet run
```

O backend estará rodando em `https://localhost:5024`

### 3. Executar o Frontend

```bash
cd controle-frontend
npm install
npm run dev
```

O frontend estará rodando em `http://localhost:5174`

## Fluxo de Uso

1. **Primeiro Acesso**
   - Acesse `http://localhost:5174`
   - Você será redirecionado para `/login`
   - Clique em "Registrar" para criar uma nova conta
   - Preencha Nome, Email e Senha
   - Após o registro, você será autenticado automaticamente

2. **Login**
   - Na tela de login, insira seu Email e Senha
   - Clique em "Entrar"
   - Você será redirecionado para a página de Pessoas

3. **Navegação**
   - Com login realizado, você pode navegar por todas as páginas
   - Seu nome aparecerá no header
   - Para sair, clique no botão "Sair" no header

4. **Segurança**
   - Todas as rotas (exceto login) estão protegidas
   - O token JWT é enviado automaticamente em todas as requisições
   - Se o token expirar ou for inválido, você será redirecionado para login

## Estrutura de Arquivos Criados

### Backend
```
controle-backend/
├── Controle.Domain/
│   ├── Entities/Usuario.cs
│   └── Interfaces/IUsuarioRepository.cs
├── Controle.Infrastructure/
│   ├── Configurations/UsuarioConfiguration.cs
│   └── Repositories/UsuarioRepository.cs
├── Controle.Application/
│   ├── DTOs/AuthRequestResponse.cs
│   ├── Interfaces/IAuthService.cs
│   └── Services/
│       ├── AuthService.cs
│       └── Result.cs (atualizado com genéricos)
└── Controle.API/
    ├── Controllers/AuthController.cs (implementado)
    ├── Extensions/
    │   ├── AuthenticationExtensions.cs (descomentado)
    │   └── DependencyInjection.cs (atualizado)
    └── Program.cs (atualizado)
```

### Frontend
```
controle-frontend/
├── src/
│   ├── api/auth.api.ts
│   ├── types/Usuario.ts
│   ├── contexts/AuthContext.tsx
│   ├── components/
│   │   ├── auth/PrivateRoute.tsx
│   │   └── layout/
│   │       ├── Header.tsx (atualizado)
│   │       └── Layout.tsx (atualizado)
│   ├── pages/
│   │   └── Auth/
│   │       ├── LoginPage.tsx
│   │       ├── LoginForm.tsx
│   │       └── RegisterForm.tsx
│   ├── routers/AppRoutes.tsx (atualizado)
│   ├── App.tsx (atualizado)
│   └── styles/global.css (atualizado)
```

## Endpoints da API

### POST /api/auth/register
Cria um novo usuário.

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/login
Autentica um usuário existente.

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Configurações

### JWT Key
A chave JWT está configurada em `appsettings.json`:
```json
{
  "Jwt": {
    "Key": "asd123ads123asd123256asd123ads123asd12325"
  }
}
```

**⚠️ IMPORTANTE:** Em produção, use uma chave mais segura e armazene em variáveis de ambiente!

### CORS
O CORS está configurado para aceitar requisições de `http://localhost:5174`. Se mudar a porta do frontend, atualize em `Program.cs`.

## Segurança

- Senhas são armazenadas com hash SHA256 (considere usar BCrypt em produção)
- Tokens JWT com validade de 7 dias
- Email único por usuário (constraint no banco de dados)
- Validação de campos obrigatórios
- Senha mínima de 6 caracteres
- Validação de email

## Melhorias Futuras (Sugestões)

1. Implementar refresh token
2. Adicionar recuperação de senha por email
3. Usar BCrypt para hash de senhas
4. Adicionar verificação de email
5. Implementar rate limiting para prevenir ataques
6. Adicionar logs de auditoria
7. Implementar 2FA (autenticação de dois fatores)
8. Adicionar roles/permissões de usuário

## Troubleshooting

### "Email já está em uso"
Cada email pode ter apenas uma conta. Use outro email ou faça login com o existente.

### "Email ou senha inválidos"
Verifique se digitou corretamente. As senhas são case-sensitive.

### "Erro 401" nas requisições
Seu token pode ter expirado. Faça login novamente.

### Redirecionamento constante para /login
Limpe o localStorage do navegador e faça login novamente:
```javascript
localStorage.clear();
```
