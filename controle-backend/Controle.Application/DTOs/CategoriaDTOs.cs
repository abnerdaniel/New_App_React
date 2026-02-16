using System;
using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class CategoriaSimplesDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int CardapioId { get; set; }
        public int OrdemExibicao { get; set; }
    }

    public class CreateCategoriaDTO
    {
        public string Nome { get; set; } = string.Empty;
        public int CardapioId { get; set; }
        public int OrdemExibicao { get; set; }
    }

    public class UpdateCategoriaDTO
    {
        public string Nome { get; set; } = string.Empty;
        public int OrdemExibicao { get; set; }
    }
}
