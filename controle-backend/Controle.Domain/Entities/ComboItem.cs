using System.Text.Json.Serialization;

namespace Controle.Domain.Entities;

public class ComboItem
{
    public int Id { get; set; }
    
    public int ComboId { get; set; }
    [JsonIgnore]
    public Combo? Combo { get; set; }

    public int ProdutoLojaId { get; set; }
    [JsonIgnore]
    public ProdutoLoja? ProdutoLoja { get; set; }

    public int Quantidade { get; set; } // Quantidade deste produto no combo
}
