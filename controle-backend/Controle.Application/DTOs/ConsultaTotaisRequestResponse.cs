using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Controle.Application.DTOs
{
    public class Integrante
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Idade { get; set; } = 0!;
        public int ValorTotalDespesa { get; set; } = 0!;
        public int ValorTotalReceita { get; set; } = 0!;
        public int Saldo { get; set; } = 0!;
    }
    public class ListaPessoasResponse
    {
        public List<Integrante> Pessoas { get; set; } = new List<Integrante>();
        public int ValorTotalGeralDespesa { get; set; } = 0!;
        public int ValorTotalGeralReceita { get; set; } = 0!;
        public int SaldoGeral { get; set; } = 0!;
    }
}
