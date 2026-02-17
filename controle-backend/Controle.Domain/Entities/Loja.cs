using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class Loja
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string CpfCnpj { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string? Instagram { get; set; } = string.Empty;
    public string? Facebook { get; set; } = string.Empty;
    public string? Twitter { get; set; } = string.Empty;
    public string? LinkedIn { get; set; } = string.Empty;
    public string? WhatsApp { get; set; } = string.Empty;
    public string? Telegram { get; set; } = string.Empty;
    public string? YouTube { get; set; } = string.Empty;
    public string? Twitch { get; set; } = string.Empty;
    public string? TikTok { get; set; } = string.Empty;
    public Guid UsuarioId { get; set; }
    public bool Ativo { get; set; } = false;
    
    // Endereço
    public string? Cep { get; set; } = string.Empty;
    public string? Logradouro { get; set; } = string.Empty;
    public string? Numero { get; set; } = string.Empty;
    public string? Complemento { get; set; } = string.Empty;
    public string? Bairro { get; set; } = string.Empty;
    public string? Cidade { get; set; } = string.Empty;
    public string? Estado { get; set; } = string.Empty;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    // Configurações da Loja
    public string? LogoUrl { get; set; }
    public string? CapaUrl { get; set; }
    public int? TempoMinimoEntrega { get; set; } // Em minutos
    public int? TempoMaximoEntrega { get; set; } // Em minutos
    public decimal? TaxaEntregaFixa { get; set; }
    public decimal? TaxaPorKm { get; set; }
    public bool? AbertaManualmente { get; set; } // Null = Segue horário, True = Forçar Aberta, False = Forçar Fechada
    public string? Categoria { get; set; } // Ex: Lanches, Japonesa
    public double? Avaliacao { get; set; } // Ex: 4.8
    
    // Configuração de Cancelamento
    public bool PermitirCancelamentoCliente { get; set; } = true;
    public string StatusMaximoCancelamento { get; set; } = "Saiu para Entrega"; // "Pendente", "Em Preparo", "Saiu para Entrega"
    
    // Configuração de Delivery
    public bool AceitandoPedidos { get; set; } = true; // Se false, não aceita novos pedidos delivery
}