# Plano de Desenvolvimento - New_App_React

## 1. Visão Geral do Projeto

O projeto é um sistema de gestão para estabelecimentos alimentícios (Restaurantes/Lanchonetes) com suporte a **Multi-tenancy** (múltiplas lojas), operando com Backend .NET e Frontend React.

### Status Atual

- **Autenticação**: Pronta (Login, Roles: Admin, Gerente, Funcionario).
- **Estrutura Base**: Controllers e Services para CRUDs principais (Loja, Funcionário, Produto, Categoria) implementados.
- **Frontend**: Rotas e estrutura de páginas principais criadas.
- **Banco de Dados**: Entidades principais definidas, incluindo Estoque (`ProdutoLoja`) e suporte a **Multicategorias** (`ProdutoCategoria`).

---

## 2. Regras de Negócio Identificadas

### 🏢 Multi-loja e Acesso

- O sistema é focado em `Loja`. Usuários e Produtos pertencem a uma Loja (via `LojaId`).
- Acesso controlado por `Cargos` (Admin, Gerente, etc.).

### 📦 Catálogo e Estoque

- **Produtos**: Base centralizada com variações por Loja (`ProdutoLoja`).
- **Multicategorias**: Um produto pode pertencer a múltiplas categorias simultaneamente (ex: "Bebidas" e "Promoções") via tabela `ProdutoCategoria`.
- **Lógica de Estoque (Novo)**:
  - **Estoque Físico**: Quantidade real no estabelecimento.
  - **Estoque Promessa/Reservado**: Quantidade comprometida em pedidos abertos, mas ainda não concluídos.
  - **Fluxo**:
    1. Pedido Criado -> Adiciona em `Estoque Reservado`.
    2. Pedido Concluído/Entregue -> Remove de `Estoque Reservado` e decrementa `Estoque Físico`.
    3. Pedido Cancelado -> Apenas remove de `Estoque Reservado` (Estoque físico não muda).

### 🛒 Pedidos e Vendas

- **Tipos de Venda**:
  1. **Mesa/Salão**: Identificado por `NumeroMesa` e `NumeroFila`.
  2. **Delivery**: Identificado por `EnderecoDeEntregaId` e dados do Cliente.
  3. **Balcão**: Pedidos sem mesa/delivery.
- **Fila de Atendimento (Senha)**:
  - Gerar número de senha/ordem sequencial para cada pedido.
  - Funcionalidade para Admin **Resetar Numeração** (ex: virada de dia).
  - Painel/Avisos visuais chamando a senha.
- **Fluxo**: O pedido tem um `Status` (string). Precisa de um fluxo definido: `Aberto` -> `Em Preparo` -> `Pronto/Enviado` -> `Concluído`.

### 📋 Cardápio Digital, Combos e Vitrine

- **Estrutura**: O cardápio organiza produtos por **Categorias** (N:N) e **Vitrines** personalizadas.
- **Combos (Entidade `Combo`)**:
  - Permite criar pacotes de produtos (`ComboItem`) com preço diferenciado.
  - **Regra**: A venda do Combo deve baixar o estoque de cada item individual composto.
- **Regras de Disponibilidade**:
  - **Horário/Dias**: Cardápios podem ser restritos por dia da semana ou horário.

---

## 3. Plano de Desenvolvimento (Roadmap)

Aqui está a organização sugerida para o desenvolvimento das funções restantes, em ordem de prioridade.

### Fase 1: Operação Básica (Core) 🔴 Prioridade Alta

O foco é permitir que uma venda aconteça do início ao fim.

#### 1.1 Gestão de Estoque e Categorização

- **Tarefa**: Adicionar campo `QuantidadeReservada` na entidade `ProdutoLoja`.
- **Tarefa**: Ajustar cadastro de produtos para permitir seleção de **Múltiplas Categorias**.
- **Lógica**: Implementar o decremento real apenas no status `Concluído`.
- **UI**: Mostrar "Disponível para venda" (Físico - Reservado).

#### 1.2 Fluxo de Pedidos e Senhas

- **Tarefa**: Criar contador de senhas (reiniciável).
- **Tarefa**: Implementar painel de chamadas/avisos.
- **UI (Cozinha/KDS)**: Criar visualização de "Pedidos Pendentes" e Senhas.

#### 1.3 Fechamento de Conta

- **Tarefa**: Calcular totais, descontos e processar "pagamento" (mesmo que apenas registrando o tipo: Dinheiro/Pix/Cartão).
- **Falta**: Entidade `Pagamento` ou `Transacao` para registrar como foi pago.

### Fase 2: Módulos Específicos 🟡 Prioridade Média

#### 2.1 Módulo Mesas

- **Objetivo**: Gestão visual do salão.
- **Funcionalidades**:
  - Mapa de Mesas (Livres/Ocupadas).
  - "Abrir Mesa" (Inicia pedido vinculado à mesa).
  - "Fechar Conta" (Libera a mesa).
- **Falta Backend**: Endpoint para retornar status atual de todas as mesas (agrupando pedidos abertos).

#### 2.2 Módulo Delivery

- **Objetivo**: Gestão logística.
- **Funcionalidades**:
  - Cadastro de Entregadores.
  - Atribuição de Pedido -> Entregador.
  - Status de entrega (Saiu para entrega / Entregue).
- **Falta**: Tabela/Lógica para vincular Entregador ao Pedido (Campo `EntregadorId` existe em algumas bases, verificar se `GarcomId` ou `AtendenteId` cobre isso, ou criar novo).

#### 2.3 Gestão de Cardápio e Combos

- **Objetivo**: Permitir vitrines dinâmicas e promoções (Combos).
- **Funcionalidades**:
  - **Configuração de Vitrine**: Cadastro de regras de exibição (Dias, Horários, Validade).
  - **Cadastro de Combos**: Interface para selecionar produtos e definir preço único.
- **Regra de Negócio**: O sistema deve validar se o item/combo está dentro do horário/dia permitido antes de vender.

### Fase 3: Financeiro e Gestão 🟢 Prioridade Planejada

#### 3.1 Financeiro

- **Faltante**: O sistema precisa de uma área para 'Caixa' (Abertura/Fechamento) e 'Contas'.
- **Tarefa**: Criar entidades `MovimentacaoFinanceira` (Entradas de vendas, Saídas de despesas).
- **UI**: Página `FinanceiroPage` para ver fluxo de caixa diário.

#### 3.2 Dashboard e Relatórios

- **Melhoria**: Transformar a página `Dashboard` atual em indicadores reais.
- **KPIs**: Vendas Hoje, Produtos mais vendidos, Ticket Médio.

---

## 4. Próximos Passos Imediatos (Sugestão para o Usuário)

1. **Revisar o Fluxo de Pedido**: Confirme se os status existentes (`Aberto`, `Fechado` etc.) atendem a cozinha e entrega.
2. **Implementar Baixa de Estoque**: É crítico para integridade dos dados.
3. **Definir Financeiro**: Onde os pagamentos serão salvos? (Só no pedido ou numa tabela de transações?).
