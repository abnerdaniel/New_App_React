# Regras de Negócio - Produtos e Estoque

## Cadastro de Produtos

1. **Entidade Produto**: Representa a definição global de um produto (Nome, Marca, Tipo, etc.). Não possui vínculo direto com uma loja específica.
2. **Tipos de Produtos**: O campo `Tipo` deve ser preenchido estritamente com um dos seguintes valores:
   - Pratos
   - Lanches
   - Porções/Petiscos
   - Bebidas
   - Sobremesas
   - Adicionais
   - Combos
   - Infantil
   - Especiais

## Cadastro de Estoque (ProdutoLoja)

1. **Vínculo**: Todo registro em `ProdutoLoja` deve estar vinculado a um `Produto` existente.
2. **Fluxo de Cadastro**:
   - Se o produto já existe (globalmente), utiliza-se o `ProdutoId` para criar o vínculo na loja com preço e estoque específicos.
   - Se o produto não existe, ele deve ser criado primeiro na tabela `Produto` e, em seguida, vinculado à loja na tabela `ProdutoLoja`.
3. **Unicidade**: Um mesmo produto não pode ser vinculado mais de uma vez à mesma loja.

## Listagem

1. **Catálogo Geral**: Listagem de todos os produtos cadastrados globalmente, utilizada para pré-preenchimento e busca.
2. **Estoque por Loja**: Listagem específica de uma loja, retornando dados combinados do produto (Nome, Imagem) com dados da loja (Preço, Estoque).
