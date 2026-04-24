using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    // ── GrupoOpcao ──────────────────────────────────────────────────────────────

    public class CreateGrupoOpcaoRequest
    {
        public string Nome { get; set; } = string.Empty;
        public int Ordem { get; set; } = 0;
        public int MinSelecao { get; set; } = 1;
        public int MaxSelecao { get; set; } = 1;
        public bool Obrigatorio { get; set; } = true;
    }

    public class UpdateGrupoOpcaoRequest
    {
        public string Nome { get; set; } = string.Empty;
        public int Ordem { get; set; } = 0;
        public int MinSelecao { get; set; } = 1;
        public int MaxSelecao { get; set; } = 1;
        public bool Obrigatorio { get; set; } = true;
    }

    public class GrupoOpcaoDTO
    {
        public int Id { get; set; }
        public int ProdutoLojaId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Ordem { get; set; }
        public int MinSelecao { get; set; }
        public int MaxSelecao { get; set; }
        public bool Obrigatorio { get; set; }
        public List<OpcaoItemDTO> Itens { get; set; } = new();
    }

    // ── OpcaoItem ──────────────────────────────────────────────────────────────

    public class CreateOpcaoItemRequest
    {
        public string Nome { get; set; } = string.Empty;
        public int Preco { get; set; } = 0; // Em centavos
        public int Ordem { get; set; } = 0;
        public bool Ativo { get; set; } = true;
    }

    public class UpdateOpcaoItemRequest
    {
        public string Nome { get; set; } = string.Empty;
        public int Preco { get; set; } = 0;
        public int Ordem { get; set; } = 0;
        public bool Ativo { get; set; } = true;
    }

    public class OpcaoItemDTO
    {
        public int Id { get; set; }
        public int GrupoOpcaoId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Preco { get; set; }
        public int Ordem { get; set; }
        public bool Ativo { get; set; }
    }

    // ── PedidoItemOpcao ─────────────────────────────────────────────────────────

    public class PedidoItemOpcaoDTO
    {
        public int OpcaoItemId { get; set; }
        public string NomeGrupo { get; set; } = string.Empty;
        public string NomeOpcao { get; set; } = string.Empty;
        public int PrecoUnitario { get; set; }
        public int Quantidade { get; set; } = 1;
    }
}
