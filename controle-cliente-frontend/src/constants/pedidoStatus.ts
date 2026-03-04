export const PedidoStatus = {
  Aberto: "Aberto",
  AguardandoAceitacao: "Aguardando Aceitação",
  Pendente: "Pendente",
  EmPreparo: "Em Preparo",
  Preparando: "Preparando",
  Pronto: "Pronto",
  SaiuParaEntrega: "Saiu para Entrega",
  Entregue: "Entregue",
  Concluido: "Concluido",
  Cancelado: "Cancelado"
} as const;

export type PedidoStatusType = typeof PedidoStatus[keyof typeof PedidoStatus];
