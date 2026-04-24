using System.Text.Json.Serialization;

namespace Controle.Domain.Entities;

public class ComboEtapaOpcao
{
    public int Id { get; set; }
    public int ComboEtapaId { get; set; }
    [JsonIgnore]
    public ComboEtapa? Etapa { get; set; }

    public int ProdutoLojaId { get; set; }
    public ProdutoLoja? ProdutoLoja { get; set; }

    public int PrecoAdicional { get; set; } // Em centavos
}
