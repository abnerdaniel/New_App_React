namespace Controle.Domain.Entities;

public class VarianteAtributoValor
{
    public int Id { get; set; }
    public int VarianteAtributoId { get; set; }
    public VarianteAtributo VarianteAtributo { get; set; } = null!;
    public string Valor { get; set; } = string.Empty; // ex: "M", "Azul"
    public string? CodigoHex { get; set; }  // ex: "#1A73E8" — somente para Cor
}
