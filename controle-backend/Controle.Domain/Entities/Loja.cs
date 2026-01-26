using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class Loja
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string CpfCnpj { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string Instagram { get; set; } = string.Empty;
    public string Facebook { get; set; } = string.Empty;
    public string Twitter { get; set; } = string.Empty;
    public string LinkedIn { get; set; } = string.Empty;
    public string WhatsApp { get; set; } = string.Empty;
    public string Telegram { get; set; } = string.Empty;
    public string YouTube { get; set; } = string.Empty;
    public string Twitch { get; set; } = string.Empty;
    public string TikTok { get; set; } = string.Empty;
    public int UsuarioId { get; set; } = 0;
    public bool Ativo { get; set; } = false;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}