using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Controle.Application.DTOs
{
    public class CategoriaRequest
    {
        [Required]
        public string Descricao { get; set; } = string.Empty;
        [Required]
        public string Finalidade { get; set; } = string.Empty;
    }
    public class CategoriaFullRequest
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string Descricao { get; set; } = string.Empty;
        [Required]
        public string Finalidade { get; set; } = string.Empty;
    }
    public class CategoriaResponse
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string Finalidade { get; set; } = string.Empty;
    }

}
