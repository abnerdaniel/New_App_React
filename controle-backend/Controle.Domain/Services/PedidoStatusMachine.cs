namespace Controle.Domain.Services;

public static class PedidoStatusMachine
{
    public const string Aberto = "Aberto"; // Opcional, raro
    public const string AguardandoAceitacao = "Aguardando Aceitação"; // Cliente app
    public const string Pendente = "Pendente"; // Alias/Item status
    public const string EmPreparo = "Em Preparo"; // Painel Pedido
    public const string Preparando = "Preparando"; // Item status
    public const string Pronto = "Pronto";
    public const string SaiuParaEntrega = "Saiu para Entrega";
    public const string Entregue = "Entregue";
    public const string Concluido = "Concluido"; // Venda rapida PDV
    public const string Cancelado = "Cancelado";

    public static int GetStatusRank(string? status)
    {
        if (string.IsNullOrEmpty(status)) return -1;
        switch (status.Trim().ToLower())
        {
            case "pendente":
            case "aguardando":
            case "aguardando aceitação":
                return 0;
            case "em preparo":
            case "preparando":
                return 1;
            case "pronto":
                return 2;
            case "saiu para entrega":
                return 3;
            case "entregue":
            case "concluido":
                return 4;
            case "cancelado":
                return 99;
            default:
                return -1;
        }
    }

    public static bool CanCancel(string currentStatus, string maxAllowedStatus)
    {
        int currentRank = GetStatusRank(currentStatus);
        int limitRank = GetStatusRank(maxAllowedStatus);

        // Cancelado is 99, can't cancel if already cancelled
        if (currentRank >= 99) return false;

        return currentRank <= limitRank;
    }
}
