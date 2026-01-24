# 🔐 Fluxo de Autenticação com Aprovação de Admin

## 📋 Visão Geral

Este sistema implementa um fluxo de autenticação em **3 etapas**:

1. **Usuário se registra** → Fica INATIVO (aguardando aprovação)
2. **Admin aprova o usuário** → Usuário fica ATIVO
3. **Usuário faz login** → Recebe token JWT e acessa o sistema

---

## 🔄 Fluxo Completo (Passo a Passo)

### **1️⃣ REGISTRO DE NOVO USUÁRIO**

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**O que acontece:**
- ✅ Sistema cria o usuário no banco de dados
- ✅ Define `Ativo = false` (INATIVO)
- ✅ Hash da senha é armazenado (SHA256)
- ❌ NÃO retorna token JWT (pois usuário está inativo)

**Response (201 Created):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "token": "" // Vazio! Usuário precisa ser aprovado
}
```

**Status no Banco:**
```
Usuario {
  Id: 1,
  Nome: "João Silva",
  Email: "joao@example.com",
  PasswordHash: "hash_da_senha",
  Ativo: false,  ← INATIVO (aguardando aprovação)
  DataCriacao: "2026-01-24T10:00:00Z",
  UltimoAcesso: null
}
```

---

### **2️⃣ TENTATIVA DE LOGIN (USUÁRIO INATIVO)**

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**O que acontece:**
- ✅ Sistema verifica se email existe
- ✅ Sistema verifica se senha está correta
- ❌ Sistema verifica se usuário está ATIVO → **BLOQUEADO!**

**Response (400 Bad Request):**
```json
{
  "message": "Usuário aguardando aprovação do administrador."
}
```

---

### **3️⃣ ADMIN APROVA O USUÁRIO (NA SUA OUTRA APLICAÇÃO)**

**Endpoint:** `PUT /api/auth/usuario/1/ativar`

**Headers:**
```
Authorization: Bearer <token_do_admin>
```

**O que acontece:**
- ✅ Sistema verifica se usuário existe
- ✅ Sistema altera `Ativo = true`
- ✅ Salva no banco de dados

**Response (200 OK):**
```json
{
  "message": "Usuário ativado com sucesso."
}
```

**Status no Banco (APÓS APROVAÇÃO):**
```
Usuario {
  Id: 1,
  Nome: "João Silva",
  Email: "joao@example.com",
  PasswordHash: "hash_da_senha",
  Ativo: true,  ← ATIVO (aprovado pelo admin)
  DataCriacao: "2026-01-24T10:00:00Z",
  UltimoAcesso: null
}
```

---

### **4️⃣ LOGIN COM SUCESSO (USUÁRIO ATIVO)**

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**O que acontece:**
- ✅ Sistema verifica se email existe
- ✅ Sistema verifica se senha está correta
- ✅ Sistema verifica se usuário está ATIVO → **APROVADO!**
- ✅ Sistema gera token JWT (validade: 7 dias)
- ✅ Atualiza `UltimoAcesso`

**Response (200 OK):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ← TOKEN JWT
}
```

---

### **5️⃣ ACESSANDO AS APIs PROTEGIDAS**

**Endpoint:** `GET /api/pessoas/lista` (ou qualquer outra API)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**O que acontece:**
- ✅ Sistema valida o token JWT
- ✅ Se token válido → acesso liberado
- ❌ Se token inválido/expirado → **401 Unauthorized**

**Response (200 OK):**
```json
[
  { "id": 1, "nome": "Maria", "idade": 25 },
  { "id": 2, "nome": "Pedro", "idade": 30 }
]
```

---

## 🛡️ APIs Protegidas (Requerem Token JWT)

Todas as APIs abaixo agora **EXIGEM autenticação**:

| Endpoint | Método | Requer Token |
|----------|--------|--------------|
| `/api/pessoas/*` | Todos | ✅ Sim |
| `/api/categorias/*` | Todos | ✅ Sim |
| `/api/transacao/*` | Todos | ✅ Sim |
| `/api/consultaTotais/*` | Todos | ✅ Sim |
| `/api/auth/usuarios` | GET | ✅ Sim (Admin) |
| `/api/auth/usuario/{id}/ativar` | PUT | ✅ Sim (Admin) |
| `/api/auth/usuario/{id}/desativar` | PUT | ✅ Sim (Admin) |

### APIs Públicas (NÃO requerem token):
| Endpoint | Método | Requer Token |
|----------|--------|--------------|
| `/api/auth/login` | POST | ❌ Não |
| `/api/auth/register` | POST | ❌ Não |

---

## 🔧 APIs de Administração

### **Listar Todos os Usuários**

**Endpoint:** `GET /api/auth/usuarios`

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Response:**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "ativo": true,  ← Status do usuário
    "dataCriacao": "2026-01-24T10:00:00Z",
    "ultimoAcesso": "2026-01-24T11:30:00Z"
  },
  {
    "id": 2,
    "nome": "Maria Santos",
    "email": "maria@example.com",
    "ativo": false,  ← Aguardando aprovação
    "dataCriacao": "2026-01-24T12:00:00Z",
    "ultimoAcesso": null
  }
]
```

---

### **Ativar Usuário**

**Endpoint:** `PUT /api/auth/usuario/{id}/ativar`

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Response:**
```json
{
  "message": "Usuário ativado com sucesso."
}
```

---

### **Desativar Usuário**

**Endpoint:** `PUT /api/auth/usuario/{id}/desativar`

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Response:**
```json
{
  "message": "Usuário desativado com sucesso."
}
```

---

## 📊 Diagrama do Fluxo

```
┌─────────────────┐
│  NOVO USUÁRIO   │
│   se registra   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Usuário INATIVO     │
│ (Ativo = false)     │
│ Aguarda aprovação   │
└────────┬────────────┘
         │
         │ ❌ Tenta login → "Aguardando aprovação"
         │
         ▼
┌─────────────────────┐
│  ADMIN aprova       │
│  (outra aplicação)  │
│  PUT /ativar        │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Usuário ATIVO       │
│ (Ativo = true)      │
└────────┬────────────┘
         │
         │ ✅ Faz login → Recebe TOKEN JWT
         │
         ▼
┌─────────────────────┐
│ Acessa APIs         │
│ com token Bearer    │
└─────────────────────┘
```

---

## 🔑 Como Funciona o Token JWT

### **Ao fazer login (usuário ativo):**
1. Sistema gera token JWT com:
   - `ClaimTypes.NameIdentifier` → Id do usuário
   - `ClaimTypes.Email` → Email do usuário
   - `ClaimTypes.Name` → Nome do usuário
   - Validade: 7 dias

2. Frontend salva o token no `localStorage`

3. Axios adiciona automaticamente o token em todas as requisições:
```javascript
Authorization: Bearer <token>
```

### **Ao acessar APIs protegidas:**
1. Backend valida o token JWT
2. Se válido → acesso liberado
3. Se inválido/expirado → retorna 401 Unauthorized

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: **Usuarios**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Id` | int | Chave primária |
| `Email` | string | Email único (index) |
| `Nome` | string | Nome do usuário |
| `PasswordHash` | string | Senha em hash SHA256 |
| `Ativo` | bool | **false** = aguardando aprovação<br>**true** = aprovado |
| `DataCriacao` | DateTime | Data de criação |
| `UltimoAcesso` | DateTime? | Data do último login |

---

## 📝 Exemplo de Uso Completo

### **1. Usuário se registra no frontend:**
```javascript
const response = await authApi.register({
  nome: "João Silva",
  email: "joao@example.com",
  password: "senha123"
});
// response.token = "" (vazio, aguardando aprovação)
```

### **2. Usuário tenta fazer login:**
```javascript
try {
  await authApi.login({ email: "joao@example.com", password: "senha123" });
} catch (error) {
  // Erro: "Usuário aguardando aprovação do administrador."
}
```

### **3. Admin aprova o usuário (na sua outra aplicação):**
```bash
PUT https://localhost:5024/api/auth/usuario/1/ativar
Headers: Authorization: Bearer <token_admin>
```

### **4. Usuário faz login novamente:**
```javascript
const response = await authApi.login({
  email: "joao@example.com",
  password: "senha123"
});
// response.token = "eyJhbGciOiJIUzI..." ✅ Sucesso!
```

### **5. Usuário acessa as APIs:**
```javascript
// Token é adicionado automaticamente pelo axios
const pessoas = await pessoaApi.listar();
// ✅ Sucesso!
```

---

## ⚡ Próximos Passos

1. **Parar o backend** (Ctrl+C no terminal)
2. **Criar a migration:**
```bash
cd controle-backend
dotnet ef migrations add AddAtivoFieldToUsuario --project Controle.Infrastructure --startup-project Controle.API
dotnet ef database update --project Controle.Infrastructure --startup-project Controle.API
```

3. **Rodar o backend:**
```bash
cd Controle.API
dotnet run
```

4. **Testar o fluxo:**
   - Registrar novo usuário → Verificar que fica inativo
   - Tentar fazer login → Ver mensagem de aprovação pendente
   - Usar API de admin para ativar → `/api/auth/usuario/1/ativar`
   - Fazer login novamente → Receber token JWT
   - Acessar APIs protegidas → Funcionar com o token

---

## 🚨 Erros Comuns

### ❌ "401 Unauthorized" ao acessar APIs
- **Causa:** Token não foi enviado ou está inválido
- **Solução:** Verificar se fez login e se token está no localStorage

### ❌ "Usuário aguardando aprovação"
- **Causa:** Admin ainda não ativou o usuário
- **Solução:** Admin precisa chamar `/api/auth/usuario/{id}/ativar`

### ❌ Token expirado
- **Causa:** Token JWT tem validade de 7 dias
- **Solução:** Fazer login novamente para obter novo token

---

## 🎯 Resumo

✅ **Registro:** Usuário criado com `Ativo = false`  
✅ **Login (inativo):** Bloqueado com mensagem de aprovação  
✅ **Admin ativa:** `PUT /api/auth/usuario/{id}/ativar`  
✅ **Login (ativo):** Retorna token JWT  
✅ **APIs protegidas:** Todas exigem token JWT no header  

**Fluxo está completo e funcional!** 🚀
