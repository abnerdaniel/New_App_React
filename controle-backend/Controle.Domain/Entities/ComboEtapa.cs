using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Controle.Domain.Entities;

public class ComboEtapa
{
    public int Id { get; set; }
    public int ComboId { get; set; }
    [JsonIgnore]
    public Combo? Combo { get; set; }

    public string Titulo { get; set; } = string.Empty;
    public int Ordem { get; set; }
    public int MinEscolhas { get; set; } = 1;
    public int MaxEscolhas { get; set; } = 1;
    public bool Obrigatorio { get; set; } = true;

    public List<ComboEtapaOpcao> Opcoes { get; set; } = new();
}
