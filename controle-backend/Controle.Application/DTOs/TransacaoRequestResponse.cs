using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Controle.Domain.Entities;

namespace Controle.Application.DTOs
{
    public class TransacaoRequest
    {
        [Required]
        public string Descricao { get; set; } = string.Empty;
        [Required]
        public decimal Valor { get; set; }
        [Required]
        public string Tipo { get; set; } = string.Empty; // despesa ou receita
        [Required]
        public int PessoaId { get; set; }
        [Required]
        public int CategoriaId { get; set; }

    }

    public class TransacaoFullRequest
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string Descricao { get; set; } = string.Empty;
        [Required]
        public decimal Valor { get; set; }
        [Required]
        public string Tipo { get; set; } = string.Empty; // despesa ou receita
        [Required]
        public int PessoaId { get; set; }
        [Required]
        public int CategoriaId { get; set; }

        // Navegação
        public Pessoa Pessoa { get; set; } = null!;
        public Categoria Categoria { get; set; } = null!;
    }

    public class TransacaoResponse
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public string Tipo { get; set; } = string.Empty; // despesa ou receita
        public int PessoaId { get; set; }
        public int CategoriaId { get; set; }

        // Navegação
        public Pessoa Pessoa { get; set; } = null!;
        public Categoria Categoria { get; set; } = null!;
    }
}
