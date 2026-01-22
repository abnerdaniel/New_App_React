using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;

public class Categoria
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string Finalidade { get; set; } = string.Empty;
}
