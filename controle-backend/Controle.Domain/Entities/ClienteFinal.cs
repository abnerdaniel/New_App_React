using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class ClienteFinal
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Apelido { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
    public int? Idade { get; set; } = 0;
    public string? Genero { get; set; } = string.Empty;
    public string? Telefone { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Instagram { get; set; } = string.Empty;
    public string? Facebook { get; set; } = string.Empty;
    public string? Twitter { get; set; } = string.Empty;
    public string? LinkedIn { get; set; } = string.Empty;
    public string WhatsApp { get; set; } = string.Empty;
    public string? Telegram { get; set; } = string.Empty;
    public string? YouTube { get; set; } = string.Empty;
    public string? Twitch { get; set; } = string.Empty;
    public string? TikTok { get; set; } = string.Empty;
    public int PedidosCancelados { get; set; } = 0;
}