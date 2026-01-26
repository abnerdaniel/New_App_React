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
    public int LojaId { get; set; } = 0;// Loja que trabalha
    public int UsuarioId { get; set; } = 0;// Usuario que cadastra
    public bool Ativo { get; set; } = false;// Usuario que cadastra
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}