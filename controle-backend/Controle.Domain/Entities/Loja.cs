using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Services;

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
    public string StatusMaximoCancelamento { get; set; } = PedidoStatusMachine.SaiuParaEntrega; // "Pendente", "Em Preparo", "Saiu para Entrega"
    
    // Configuração de Delivery
    public bool AceitandoPedidos { get; set; } = true; // Se false, não aceita novos pedidos delivery
    
    // Automação
    public bool AceiteAutomatico { get; set; } = false; // Se true, pedido vai direto para "Em Preparo" ao chegar
    public bool DespachoAutomatico { get; set; } = false; // Se true, pedido vai direto para "Saiu para Entrega" ao ficar "Pronto"
    
    // Licenciamento (Super Admin)
    public DateTime? LicencaValidaAte { get; set; }
    public bool BloqueadaPorFaltaDePagamento { get; set; } = false;
    public string? UrlComprovantePagamento { get; set; }

    // Evolution API Integration
    public string? EvolutionInstanceName { get; set; }
    public string EvolutionConnectionStatus { get; set; } = "DISCONNECTED"; // DISCONNECTED, PENDING_QR, CONNECTED

    // IA & Atendimento
    public bool IaEnabled { get; set; } = true;
    public bool SendCustomerNumber { get; set; } = false;
    public bool SendOrderSummary { get; set; } = false;
    public bool OrderUpdates { get; set; } = false;
    public bool BotWithoutIA { get; set; } = false;

    // Order Summary Customization
    public string? OrderSummaryTemplate { get; set; }
    public bool ShowAddressOnSummary { get; set; } = true;
    public bool ShowPaymentOnSummary { get; set; } = true;
}