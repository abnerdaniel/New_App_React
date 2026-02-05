using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class Bloqueios
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public Guid LojaId { get; set; }
    public string? Motivo { get; set; } = string.Empty;
    public DateTime Data { get; set; }
    public enum StatusBloqueio { Ativo, Revogado, Expirado }
    public StatusBloqueio Status { get; set; }
    public string? Tipo { get; set; } = string.Empty;

}