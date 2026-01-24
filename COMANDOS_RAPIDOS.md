# ⚡ Comandos Rápidos - Setup Completo

## 🛠️ Passo 1: Criar Migration do Campo "Ativo"

No terminal, navegue até o diretório do backend:

```powershell
cd c:\Users\eu\Desktop\Projetos\React\App_new\New_App_React\controle-backend
```

Crie a migration:

```powershell
dotnet ef migrations add AddCampoAtivoUsuario --project Controle.Infrastructure --startup-project Controle.API
```

Aplique no banco de dados:

```powershell
dotnet ef database update --project Controle.Infrastructure --startup-project Controle.API
```

---

## 🚀 Passo 2: Rodar o Backend

```powershell
cd Controle.API
dotnet run
```

O backend estará em: `https://localhost:5024`

---

## 💻 Passo 3: Rodar o Frontend

Em outro terminal:

```powershell
cd c:\Users\eu\Desktop\Projetos\React\App_new\New_App_React\controle-frontend
npm run dev
```

O frontend estará em: `http://localhost:5174`

---

## 🧪 Passo 4: Testar o Fluxo

### **1. Registrar Usuário**
- Acesse: `http://localhost:5174`
- Será redirecionado para `/login`
- Clique em **"Registrar"**
- Preencha os dados e registre

**Resultado:** Usuário criado com `Ativo = false`

---

### **2. Tentar Fazer Login**
- Tente fazer login com o usuário que acabou de criar

**Resultado:** Erro "Usuário aguardando aprovação do administrador."

---

### **3. Aprovar Usuário (Como Admin)**

**Opção A - Via Postman/Insomnia:**

```
PUT https://localhost:5024/api/auth/usuario/1/ativar
Headers:
  Authorization: Bearer <seu_token_de_admin>
```

**Opção B - Via cURL:**

```powershell
curl -X PUT "https://localhost:5024/api/auth/usuario/1/ativar" `
  -H "Authorization: Bearer <seu_token_de_admin>" `
  -k
```

**Opção C - Via Swagger:**
1. Acesse: `https://localhost:5024`
2. Autorize com seu token de admin
3. Execute: `PUT /api/auth/usuario/{id}/ativar`

---

### **4. Fazer Login Novamente**
- Faça login com o usuário aprovado

**Resultado:** Login com sucesso! Token JWT recebido.

---

### **5. Testar APIs Protegidas**
- Navegue para `/pessoas`, `/categorias`, etc.
- Todas as requisições agora exigem o token JWT

**Resultado:** APIs funcionando com autenticação!

---

## 📋 APIs de Administração

### **Listar Usuários**
```
GET https://localhost:5024/api/auth/usuarios
Headers:
  Authorization: Bearer <token>
```

### **Ativar Usuário**
```
PUT https://localhost:5024/api/auth/usuario/{id}/ativar
Headers:
  Authorization: Bearer <token>
```

### **Desativar Usuário**
```
PUT https://localhost:5024/api/auth/usuario/{id}/desativar
Headers:
  Authorization: Bearer <token>
```

---

## ❓ Como Obter um Token de Admin?

### **Método 1: Ativar Manualmente no Banco**

1. Registre um usuário que será o admin
2. No banco de dados PostgreSQL, execute:

```sql
UPDATE "Usuarios" 
SET "Ativo" = true 
WHERE "Email" = 'admin@example.com';
```

3. Faça login com esse usuário para obter o token

---

### **Método 2: Criar um Endpoint Temporário**

Adicione temporariamente no `AuthController.cs`:

```csharp
[HttpPost("primeiro-admin")]
[AllowAnonymous]
public async Task<IActionResult> CriarPrimeiroAdmin([FromBody] RegisterRequest request)
{
    var usuario = new Usuario
    {
        Nome = request.Nome,
        Email = request.Email,
        PasswordHash = HashPassword(request.Password),
        Ativo = true, // JÁ ATIVO
        DataCriacao = DateTime.UtcNow
    };
    
    await _usuarioRepository.AddAsync(usuario);
    var token = GenerateJwtToken(usuario);
    
    return Ok(new AuthResponse 
    { 
        Id = usuario.Id, 
        Nome = usuario.Nome, 
        Email = usuario.Email, 
        Token = token 
    });
}
```

Use uma vez e depois remova!

---

## 🔍 Verificar Status no Banco

```sql
SELECT "Id", "Nome", "Email", "Ativo", "DataCriacao", "UltimoAcesso"
FROM "Usuarios"
ORDER BY "Id" DESC;
```

---

## 🐛 Troubleshooting

### Erro: "Swagger não funciona"
**Solução:** Pare o backend (Ctrl+C), limpe e compile novamente:
```powershell
dotnet clean
dotnet build
dotnet run
```

### Erro: "Migration já existe"
**Solução:** Se a migration já foi criada, apenas aplique:
```powershell
dotnet ef database update --project Controle.Infrastructure --startup-project Controle.API
```

### Erro: "401 Unauthorized"
**Solução:** Verifique se o token está sendo enviado no header:
```
Authorization: Bearer <seu_token>
```

### Frontend não está enviando token
**Solução:** Verifique se fez login e se o token está no localStorage:
```javascript
console.log(localStorage.getItem('@App:token'));
```

---

## ✅ Checklist de Teste Completo

- [ ] Backend rodando sem erros
- [ ] Frontend rodando sem erros
- [ ] Swagger acessível em `https://localhost:5024`
- [ ] Registrar novo usuário (fica inativo)
- [ ] Tentar login (bloqueado)
- [ ] Ativar usuário via API admin
- [ ] Login bem-sucedido (recebe token)
- [ ] Acessar `/pessoas` (requer token)
- [ ] Acessar `/categorias` (requer token)
- [ ] Logout funciona
- [ ] Login novamente funciona

---

## 🎯 Resumo dos Endpoints

### Públicos (sem token):
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login

### Protegidos (com token):
- `GET /api/auth/usuarios` - Listar usuários (admin)
- `PUT /api/auth/usuario/{id}/ativar` - Ativar usuário (admin)
- `PUT /api/auth/usuario/{id}/desativar` - Desativar usuário (admin)
- `GET /api/pessoas/*` - Todas as rotas de pessoas
- `GET /api/categorias/*` - Todas as rotas de categorias
- `GET /api/transacao/*` - Todas as rotas de transações
- `GET /api/consultaTotais/*` - Todas as rotas de totais

---

**Está tudo pronto! 🚀**

Leia o arquivo `FLUXO_AUTENTICACAO.md` para entender o fluxo completo em detalhes.
