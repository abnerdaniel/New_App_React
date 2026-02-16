using System;
using System.Collections.Generic;

namespace Controle.Domain.Entities;

public class Combo
{
    public int Id { get; set; }
    public Guid LojaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int Preco { get; set; } // Em centavos
    public string? ImagemUrl { get; set; }
    public bool Ativo { get; set; }

    public List<ComboItem> Itens { get; set; } = new();
    
    // Relação opcional com Categoria (se quisermos categorizar combos)
    public int? CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }
}
