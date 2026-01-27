using System;
using System.Collections.Generic;

namespace Controle.Domain.Entities;

public class Cardapio
{
    public int Id { get; set; }
    public Guid LojaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TimeSpan? HorarioInicio { get; set; }
    public TimeSpan? HorarioFim { get; set; }
    public string DiasSemana { get; set; } = string.Empty;
    public bool Ativo { get; set; }
    public bool Principal { get; set; }
    
    public List<Categoria> Categorias { get; set; } = new(); 
}