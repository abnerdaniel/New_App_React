using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Controle.Application.DTOs
{
    public class PessoaRequest
    {
        [Required]
        public string Nome { get; set; } = null!;
        [Required]
        public int Idade { get; set; } = 0!;
    }

    public class PessoaFullRequest
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string Nome { get; set; } = null!;
        [Required]
        public int Idade { get; set; } = 0!;
    }

    public class PessoaResponse
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Idade { get; set; } = 0;
    }
}
