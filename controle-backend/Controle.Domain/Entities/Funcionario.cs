using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class Funcionario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;// Nome do Funcionario
    public int CargoId { get; set; } = 0;// Cargo que trabalha
    public Guid? LojaId { get; set; }
    public Guid UsuarioId { get; set; }
    public bool Ativo { get; set; } = false;// Usuario que cadastra
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public bool AcessoSistemaCompleto { get; set; } = false;
    public string? Telefone { get; set; }
}