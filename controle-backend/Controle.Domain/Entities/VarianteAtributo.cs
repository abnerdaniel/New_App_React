using System;
using System.Collections.Generic;

namespace Controle.Domain.Entities;

public class VarianteAtributo
{
    public int Id { get; set; }
    public Guid LojaId { get; set; }
    public string Nome { get; set; } = string.Empty; // ex: "Tamanho", "Cor"
    public ICollection<VarianteAtributoValor> Valores { get; set; } = new List<VarianteAtributoValor>();
}
