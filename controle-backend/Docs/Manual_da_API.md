# Manual de Uso da API - Controle Backend

Esta API fornece serviços para gestão de lojas, produtos e usuários.

## 1. Configuração Inicial

Certifique-se de que o backend está rodando:

```bash
cd controle-backend
dotnet run --project Controle.API
```

A API estará acessível em `http://localhost:5000` (ou porta configurada).
Acesse a documentação Swagger em: `/swagger/index.html`

## 2. Autenticação

A API utiliza JWT (JSON Web Token) para segurança. A maioria dos endpoints requer um token válido.

### Login

**Endpoint**: `POST /api/auth/login`

**Corpo da Requisição**:

```json
{
  "login": "seu_login",
  "password": "sua_senha"
}
```

**Resposta (Sucesso 200)**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "nome": "Nome do Usuário",
    "lojas": [...]
  }
}
```

### Usando o Token

Para acessar rotas protegidas (ex: `/api/produtos`), adicione o cabeçalho `Authorization`:

`Authorization: Bearer <SEU_TOKEN_AQUI>`

## 3. Fluxos Principais

### Cadastro de Novo Usuário/Loja

1.  Envie `POST /api/auth/register` com os dados do usuário.
2.  Se for um registro simples, o usuário entra como **Inativo** até aprovação.
3.  Se um `lojaId` for fornecido (ou fluxo de criação de loja), o usuário pode ser ativado automaticamente dependendo da regra de negócio.

### Gerenciamento de Produtos

- **Listar Tipos**: `GET /api/produtos/tipo/{tipo}` (Ex: Lanches, Bebidas)
- **Cadastrar Produto (Global)**: `POST /api/produtos` (Requer Token de Admin/Gerente)

### Estoque da Loja (ProdutoLoja)

- Vincule um Produto Global à sua Loja usando `POST /api/produtoloja`.
- Neste vínculo você define o **Preço** e **Estoque** específicos da sua loja.

## 4. Tratamento de Erros

A API retorna objetos de erro padronizados:

```json
{
  "success": false,
  "errors": ["Mensagem de erro explicativa"]
}
```

Verifique sempre o campo `success` na resposta.
