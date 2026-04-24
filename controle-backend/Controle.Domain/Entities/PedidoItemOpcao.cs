namespace Controle.Domain.Entities;

/// <summary>
/// Registra as opções escolhidas pelo cliente para um item de pedido configurável
/// </summary>
public class PedidoItemOpcao
{
    public int Id { get; set; }
    public int PedidoItemId { get; set; }
    public PedidoItem PedidoItem { get; set; } = null!;

    public int OpcaoItemId { get; set; }
    public OpcaoItem OpcaoItem { get; set; } = null!;

    public string NomeGrupo { get; set; } = string.Empty;   // Snapshot: nome do grupo no momento do pedido
    public string NomeOpcao { get; set; } = string.Empty;   // Snapshot: nome da opção no momento do pedido
    public int PrecoUnitario { get; set; } = 0;             // Snapshot: preço da opção em centavos
    public int Quantidade { get; set; } = 1;
}
